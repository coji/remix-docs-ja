import { buildIndex } from '@remix-docs-ja/scripts/build-index'
import { buildMenus } from '@remix-docs-ja/scripts/build-menu'

await buildIndex('remix')
await buildMenus()
