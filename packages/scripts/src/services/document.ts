import { load as $ } from 'cheerio'
import fs from 'node:fs/promises'
import path from 'node:path'
import { processMarkdown } from './md.server'

interface GetDocOptions {
  productId: string
}

export const getDoc = async (file: string, options: GetDocOptions) => {
  const filepath = path.join('./docs', `${file}.md`)
  try {
    const content = await fs.readFile(filepath, 'utf-8')
    const doc = await processMarkdown(content, { productId: options.productId })
    const headings = createTableOfContentsFromHeadings(doc.html)
    return { ...doc, headings }
  } catch (e) {
    return null
  }
}

export const getDocJson = async (file: string) => {
  const filepath = path.join('./prebuild/docs', `${file}.json`)
  try {
    const content = await fs.readFile(filepath, 'utf-8')
    return JSON.parse(content) as {
      attributes: { title: string }
      raw: string
      html: string
      headings: { headingLevel: string; html: string; slug: string }[]
    }
  } catch (e) {
    return null
  }
}

// create table of contents from h2 and h3 headings
const createTableOfContentsFromHeadings = (html: string) => {
  const $headings = $(html)('h2,h3')

  const headings = $headings.toArray().map((heading) => ({
    headingLevel: heading.name,
    html: $(heading)('a').remove().end().children().text(),
    slug: heading.attributes.find((attr) => attr.name === 'id')?.value,
  }))

  return headings
}
