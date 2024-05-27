import fs from 'node:fs/promises'
import path from 'node:path'
import { processMarkdown } from '~/services/md.server'

export const getDoc = async (file: string) => {
  const filepath = path.join('./docs', `${file}.md`)
  const content = await fs.readFile(filepath, 'utf-8')
  const doc = await processMarkdown(content)
  return doc
}
