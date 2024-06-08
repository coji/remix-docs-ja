import { remember } from '@epic-web/remember'
import { load as $ } from 'cheerio'
import fs from 'node:fs/promises'
import path from 'node:path'
import { processMarkdown } from '~/services/md.server'

export const getDoc = async (file: string) => {
  return await remember(`doc-${file}`, async () => {
    const filepath = path.join('./docs', `${file}.md`)
    const content = await fs.readFile(filepath, 'utf-8')
    const doc = await processMarkdown(content)
    const headings = createTableOfContentsFromHeadings(doc.html)
    return { ...doc, headings }
  })
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
