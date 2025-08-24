import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

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
  const system = `You are a professional technical documentation translator specializing in React Router and Remix documentation.

Your task is to translate the following text from English to Japanese.

Important guidelines:
1. Preserve all Markdown formatting, code blocks, and frontmatter exactly as they are
2. Do NOT translate code examples, variable names, function names, or technical identifiers
3. Keep all URLs, file paths, and references intact
4. Maintain the same document structure and formatting
5. Use natural Japanese that is appropriate for technical documentation
6. For technical terms that are commonly used in English by Japanese developers, keep them in English
7. Ensure the translation is complete - do not truncate or skip any content

If previous translated text is provided, try to keep the existing translation as much as possible and only translate the changed parts to maintain consistency.`

  const prompt = `
${prevTranslatedText ? `<PreviousTranslated>\n${prevTranslatedText}\n</PreviousTranslated>\n\n` : ''}
<Source>\n${source}\n</Source>\n\n
${extraPrompt ? `<ExtraPrompt>\n${extraPrompt}\n</ExtraPrompt>\n\n` : ''}

Please provide the complete Japanese translation of the source text above. Return ONLY the translated text without any additional explanation or wrapping.`

  try {
    const result = await generateText({
      model: google('gemini-2.5-flash'),
      system,
      prompt,
      temperature: 0,
    })

    const translatedText = result.text.trim()

    // Validate that the output is not truncated
    // Check if the translated text ends abruptly (common signs of truncation)
    if (translatedText.length === 0) {
      return { type: 'error', error: 'Translation returned empty text' }
    }

    return {
      type: 'success',
      translatedText,
    }
  } catch (e) {
    console.error('Translation error:', e)
    let errorMessage = ''
    if (e instanceof Error) {
      errorMessage = `${e.name}: ${e.message}`
      if (e.stack) {
        console.error('Stack trace:', e.stack)
      }
    } else {
      errorMessage = String(e)
    }
    return { type: 'error', error: errorMessage }
  }
}
