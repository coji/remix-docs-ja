import { transformerCopyButton } from '@rehype-pretty/transformers'
import { transformerNotationDiff } from '@shikijs/transformers'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

import parseFrontMatter from 'front-matter'

import { addBaseUrlFn } from './md-plugins/add-base-url'
import createCompatList from './md-plugins/compat-tokens'
import { stripLinkExtPlugin } from './md-plugins/strip-link-ext'
import type { ProcessorOptions } from './md-plugins/types'

let processor: Awaited<ReturnType<typeof getProcessor>>
export async function processMarkdown(
  content: string,
  options?: ProcessorOptions,
) {
  processor = processor || (await getProcessor(options))
  const { attributes, body: raw } =
    parseFrontMatter<Record<string, number | string>>(content)
  const vfile = await processor.process(raw)
  const html = vfile.value.toString()
  return { attributes, raw, html }
}

export function getProcessor(options?: ProcessorOptions) {
  return (
    unified()
      .use(remarkParse)
      .use(stripLinkExtPlugin, options)
      .use(remarkGfm)
      .use(createCompatList)
      .use(remarkRehype, { allowDangerousHtml: true })
      // @ts-expect-error
      .use(rehypePrettyCode, {
        transformers: [
          transformerNotationDiff(),
          transformerCopyButton({
            visibility: 'always',
            feedbackDuration: 3_000,
          }),
        ],
      })
      .use(rehypeSlug)
      .use(rehypeAutolinkHeadings)
      .use(rehypeRaw)
      .use(addBaseUrlFn(options?.productId))
      .use(rehypeStringify, { allowDangerousHtml: true })
  )
}
