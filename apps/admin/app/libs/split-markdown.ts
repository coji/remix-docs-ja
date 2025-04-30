import { remark } from 'remark'
import remarkFrontmatter from 'remark-frontmatter'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'

const processor = remark()
  .use(remarkParse)
  .use(remarkFrontmatter)
  .use(remarkStringify, { tightDefinitions: true })

export const splitMarkdownByHeaders = (markdownText: string): string[] => {
  const ast = processor.parse(markdownText)

  const chunks: string[] = []
  let currentChunk = ''

  for (const node of ast.children) {
    if (node.type === 'heading') {
      if (currentChunk) {
        chunks.push(currentChunk.trim())
      }
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      currentChunk = processor.stringify(node as any)
    } else {
      currentChunk += `\n${
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        processor.stringify(node as any)
      }`
    }
  }

  if (currentChunk) {
    chunks.push(`${currentChunk.trim()}\n`)
  }

  return chunks
}
