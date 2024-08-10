import glob from 'fast-glob'
import fs from 'node:fs/promises'
import path from 'node:path'
import * as pagefind from 'pagefind'
import { getDoc } from '~/services/document.server'
import { prebuildMenu } from '~/services/menu.server'
import { getOgpImageResponse } from '~/services/ogp-image.server'

const buildIndex = async () => {
  const { index } = await pagefind.createIndex({})
  if (!index) throw new Error('index is not created')

  const docs = await glob('docs/**/*.md')
  for (const filename of docs) {
    const pathname = filename.replace(/^docs\//, '').replace(/\.md$/, '')
    const doc = await getDoc(pathname)
    if (!doc) continue

    console.log(filename)

    const jsonFilename = path.join('public/docs', `${pathname}.json`)
    const jsonDir = path.dirname(jsonFilename)
    await fs.mkdir(jsonDir, { recursive: true })
    await fs.writeFile(jsonFilename, JSON.stringify(doc, null, 2), {
      encoding: 'utf-8',
    })

    if (!doc.attributes.hidden) {
      await index.addCustomRecord({
        content: doc.html,
        meta: { title: doc.attributes.title.toString() },
        language: 'ja',
        url: pathname,
      })
    }

    const ogpImage = await getOgpImageResponse(
      new Request(`https://remix.run/docs/${pathname}`),
      pathname,
    )

    await fs.mkdir(path.dirname(`public/ogp/${pathname}`), { recursive: true })
    await fs.writeFile(
      `public/ogp/${pathname}.png`,
      Buffer.from(await ogpImage.arrayBuffer()),
    )
  }

  await index.writeFiles({ outputPath: 'public/pagefind' })
}

await buildIndex()
await prebuildMenu()
