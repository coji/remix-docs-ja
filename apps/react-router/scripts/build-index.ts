import { buildBM25IndexFromDocs } from '@remix-docs-ja/scripts/build-bm25-index'
import { buildDocs } from '@remix-docs-ja/scripts/build-docs'
import { buildMenus } from '@remix-docs-ja/scripts/build-menu'
import { join } from 'node:path'

const docsPath = join(process.cwd(), 'docs')
const productId = 'react-router-v7'

// Build docs JSON and OGP images in parallel
const docs = await buildDocs({
  docsPath,
  outputPath: join(process.cwd(), 'prebuild/docs'),
  ogpOutputPath: join(process.cwd(), 'public/ogp'),
  productId,
  concurrency: 10,
})

// Build BM25 index from the already-processed docs (no MD re-processing)
await buildBM25IndexFromDocs({
  docs,
  outputPath: join(process.cwd(), 'public/search-index'),
  product: productId,
})

// Build menus
await buildMenus()
