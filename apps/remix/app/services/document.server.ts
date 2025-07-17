import fs from 'node:fs/promises'
import path from 'node:path'

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
    console.error(`Error reading file ${filepath}:`, e)
    return null
  }
}
