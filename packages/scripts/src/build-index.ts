import glob from 'fast-glob'
import fs from 'node:fs/promises'
import path from 'node:path'
import * as pagefind from 'pagefind'
import { getDoc } from './services/document'
import { getOgpImageResponse } from './services/ogp-image.server'

export const buildIndex = async (productId: string) => {
  const { index } = await pagefind.createIndex({})
  if (!index) throw new Error('index is not created')

  const docs = await glob(path.join('docs', '/**/*.md'))
  for (const filename of docs) {
    const regexp = /^docs\//
    const pathname = filename.replace(regexp, '').replace(/\.md$/, '')
    const doc = await getDoc(pathname)
    if (!doc) {
      console.log('doc not found:\n\n', pathname)
      continue
    }

    const jsonFilename = path.join('prebuild/docs', `${pathname}.json`)
    const jsonDir = path.dirname(jsonFilename)
    await fs.mkdir(jsonDir, { recursive: true })
    await fs.writeFile(jsonFilename, JSON.stringify(doc, null, 2), {
      encoding: 'utf-8',
    })
    console.log('doc:', jsonFilename)

    // OGP画像生成
    const ogpImage = await getOgpImageResponse(
      new Request(`https://${productId}.techtalk.jp/${pathname}`),
      pathname,
    )
    await fs.mkdir(path.dirname(`public/ogp/${pathname}`), {
      recursive: true,
    })
    const ogpFilename = `public/ogp/${pathname}.png`
    await fs.writeFile(ogpFilename, Buffer.from(await ogpImage.arrayBuffer()))
    console.log('ogp:', ogpFilename)

    // 検索インデックス追加
    if (!doc.attributes.hidden) {
      await index.addCustomRecord({
        content: doc.html,
        meta: { title: doc.attributes.title?.toString() },
        language: 'ja',
        url: pathname,
      })
    }
  }

  await index.writeFiles({ outputPath: 'public/pagefind' })
}
