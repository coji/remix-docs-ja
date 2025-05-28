import { google } from '@ai-sdk/google'
import type { CoreMessage } from 'ai'
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
  const systemPrompt =
    'Translate the following text to Japanese. Markdowns should be left intact. If previous translated text is provided, try to keep the existing translation as much as possible and only translate the changed parts.'
  const messages: CoreMessage[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: `Previous translated text: ${prevTranslatedText ?? ''}\n\nSource text: ${source}`,
    },
  ]

  if (extraPrompt) {
    messages.push({
      role: 'user',
      content: extraPrompt,
    })
  }

  try {
    const ret = await generateObject({
      model: google('gemini-2.5-flash-preview-05-20'),
      messages,
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
