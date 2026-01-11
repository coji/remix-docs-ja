import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

interface TranslateSuccess {
  type: 'success'
  translatedText: string
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

const SYSTEM_PROMPT = `<role>
You are a professional technical documentation translator specializing in React Router and Remix documentation.
You translate English documentation to Japanese with high accuracy and natural expression.
</role>

<constraints>
1. PRESERVE exactly: Markdown formatting, code blocks, frontmatter (YAML), HTML tags, URLs, file paths
2. DO NOT translate: code examples, variable names, function names, component names, technical identifiers
3. KEEP in English: Technical terms commonly used by Japanese developers (e.g., props, state, hook, component, router, loader, action)
4. USE natural Japanese appropriate for technical documentation
5. COMPLETE translation required - never truncate or skip any content
6. MAINTAIN the same document structure, headings, and formatting
</constraints>

<translation_examples>
Example 1 - Basic documentation:
<source>
# \`<Await>\`

To get started with streaming data, check out the [Streaming Guide][streaming_guide].

The \`<Await>\` component is responsible for resolving deferred loader promises.

\`\`\`tsx
import { Await } from "@remix-run/react";
\`\`\`
</source>
<translation>
# \`<Await>\`

ストリーミングデータの利用を開始するには、[ストリーミングガイド][streaming_guide]を参照してください。

\`<Await>\` コンポーネントは、遅延ローダーの Promise を解決する役割を担います。

\`\`\`tsx
import { Await } from "@remix-run/react";
\`\`\`
</translation>

Example 2 - Frontmatter and description:
<source>
---
title: Remix Docs Home
description: Learn how to Build Better Websites with Remix.
---

# Remix Docs
</source>
<translation>
---
title: Remix ドキュメントホーム
description: Remix でより良いウェブサイトを構築する方法を学びましょう。
---

# Remix ドキュメント
</translation>
</translation_examples>

<output_format>
Return ONLY the translated Markdown text.
Do not include any explanations, comments, or wrapping.
The output should be directly usable as a Japanese documentation file.
</output_format>`

const buildUserPrompt = ({
  source,
  extraPrompt,
  prevTranslatedText,
}: TranslateProps): string => {
  const mode = prevTranslatedText ? 'update' : 'new'

  let prompt = ''

  if (mode === 'update') {
    prompt += `<translation_mode>
UPDATE MODE: A previous translation exists.
- Preserve the existing translation style and terminology choices
- Only update parts that correspond to changed content in the source
- Maintain consistency with the previous translation
</translation_mode>

<previous_translation>
${prevTranslatedText}
</previous_translation>

`
  } else {
    prompt += `<translation_mode>
NEW MODE: This is a new translation. Translate the entire document.
</translation_mode>

`
  }

  if (extraPrompt) {
    prompt += `<additional_instructions>
${extraPrompt}
</additional_instructions>

`
  }

  prompt += `<source_document>
${source}
</source_document>

<task>
Translate the source document above to Japanese following all constraints and guidelines.
${mode === 'update' ? 'Preserve existing translations where the source has not changed.' : ''}
</task>

<self_check>
Before outputting, verify:
1. All Markdown formatting is preserved
2. Code blocks are unchanged
3. No content is truncated or skipped
4. Technical terms are handled consistently
5. The translation reads naturally in Japanese
</self_check>`

  return prompt
}

export const translateByGemini = async (
  props: TranslateProps,
): Promise<TranslateSuccess | TranslateError> => {
  const { source } = props

  try {
    const result = await generateText({
      model: google('gemini-2.5-flash'),
      system: SYSTEM_PROMPT,
      prompt: buildUserPrompt(props),
      temperature: 1, // Recommended for Gemini 2.5
    })

    const translatedText = result.text.trim()

    // Validation checks
    if (!translatedText || translatedText.length === 0) {
      return { type: 'error', error: 'Translation resulted in empty text' }
    }

    // Check for truncation indicators
    const sourceHasClosingTags = source.includes('</')
    const translationHasClosingTags = translatedText.includes('</')
    const isTruncated =
      translatedText.endsWith('...') ||
      translatedText.length < source.length * 0.3 ||
      (sourceHasClosingTags && !translationHasClosingTags)

    if (isTruncated) {
      return {
        type: 'error',
        error: `Translation appears truncated (source: ${source.length} chars, translation: ${translatedText.length} chars)`,
      }
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
