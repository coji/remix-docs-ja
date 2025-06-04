import { buildBM25Index } from '@remix-docs-ja/scripts/build-bm25-index'
import { buildIndex } from '@remix-docs-ja/scripts/build-index'
import { buildMenus } from '@remix-docs-ja/scripts/build-menu'
import { join } from 'node:path'

// Build Pagefind index (legacy)
await buildIndex('react-router-v7')

// Build BM25 index (new)
await buildBM25Index({
  docsPath: join(process.cwd(), '../../docs/react-router-v7'),
  outputPath: join(process.cwd(), 'public/search-index'),
  product: 'react-router-v7',
})

await buildMenus()
