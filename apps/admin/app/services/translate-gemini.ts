import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

const outputSchema = z.object({
  translatedText: z.string(),
})

interface TranslateSuccess {
  type: 'success'
  translatedText: string
  diff?: string
}

interface TranslateError {
  type: 'error'
  error: string
}

interface TranslateProps {
  source: string
  extraPrompt?: string
  prevTranslatedText?: string
}

export const translateByGemini = async ({
  source,
  extraPrompt,
  prevTranslatedText,
}: TranslateProps): Promise<TranslateSuccess | TranslateError> => {
  const system = `
Translate the following text to Japanese.
Frontmatter and Markdowns should be left intact.

If previous translated text is provided, try to keep the existing translation as much as possible and only translate the changed parts.`

  const prompt = `
${prevTranslatedText ? `<PreviousTranslated>\n${prevTranslatedText}\n</PreviousTranslated>\n\n` : ''}
<Source>\n${source}\n</Source>\n\n
${extraPrompt ? `<ExtraPrompt>\n${extraPrompt}\n</ExtraPrompt>\n\n` : ''}
`

  try {
    const ret = await generateObject({
      model: google('gemini-2.5-flash'),
      system,
      prompt,
      schema: outputSchema,
      temperature: 0,
    })

    return {
      type: 'success',
      ...ret.object,
    }
  } catch (e) {
    console.log(e)
    let errorMessage = ''
    if (e instanceof Error) {
      errorMessage = `${e.name}: ${e.message}, ${e.stack}`
    } else {
      errorMessage = String(e)
    }
    return { type: 'error', error: errorMessage }
  }
}
