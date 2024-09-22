import glob from 'fast-glob'
import fs from 'node:fs/promises'
import path from 'node:path'
import * as pagefind from 'pagefind'
import { type ProductId, products } from '~/features/product/products'
import { getOgpImageResponse } from '~/services/ogp-image.server'
import { getDoc } from './services/document'
import { buildMenus } from './services/menu'

const buildIndex = async (productId: ProductId) => {
  const { index } = await pagefind.createIndex({})
  if (!index) throw new Error('index is not created')

  const docs = await glob(path.join('docs', productId, '/**/*.md'))
  for (const filename of docs) {
    const regexp = new RegExp(`^docs/${productId}/`)
    const pathname = filename.replace(regexp, '').replace(/\.md$/, '')
    const doc = await getDoc(productId, pathname)
    if (!doc) continue

    console.log(path.join(productId, pathname))
    const jsonFilename = path.join('public/docs', productId, `${pathname}.json`)
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

    // OGP画像生成
    const ogpImage = await getOgpImageResponse(
      new Request(`https://${productId}.techtalk.jp/${pathname}`),
      pathname,
    )
    await fs.mkdir(path.dirname(`public/ogp/${productId}/${pathname}`), {
      recursive: true,
    })
    const ogpFilename = `public/ogp/${productId}/${pathname}.png`
    await fs.writeFile(ogpFilename, Buffer.from(await ogpImage.arrayBuffer()))
  }

  await index.writeFiles({ outputPath: `public/pagefind/${productId}` })
}

for (const product of products) {
  await buildIndex(product.id)
  await buildMenus(product.id)
}
