import glob from 'fast-glob'
import path from 'node:path'
import * as pagefind from 'pagefind'
import { getDoc } from '~/services/document.server'

const buildIndex = async () => {
  const { index } = await pagefind.createIndex({
    forceLanguage: 'ja',
    rootSelector: 'html',
  })
  if (!index) throw new Error('index is not created')

  const docs = await glob('docs/**/*.md', { cwd: process.cwd() })
  for (const filename of docs) {
    const { dir, name } = path.parse(filename)
    const pathname = path.join('/', path.basename(dir), name)
    const doc = await getDoc(pathname)
    if (!doc || doc.attributes.hidden) {
      continue
    }

    await index.addCustomRecord({
      content: doc.html,
      meta: { title: doc.attributes.title as string },
      language: 'ja',
      url: pathname,
    })
  }

  await index.writeFiles({
    outputPath: 'public/pagefind',
  })
  const { files } = await index.getFiles()
  console.log(`${files.length} files are indexed.`)
}

await buildIndex()
