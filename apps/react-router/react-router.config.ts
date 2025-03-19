import type { Config } from '@react-router/dev/config'
import { buildMenu } from '@remix-docs-ja/scripts/services/menu'

export default {
  ssr: false,
  prerender: async () => {
    const paths = ['/', '/sitemap.xml', '/resources/search']
    const categories = await buildMenu()
    for (const category of categories) {
      for (const doc of category.children) {
        if (doc.children.length === 0) {
          paths.push(doc.slug)
        }

        for (const subDoc of doc.children) {
          paths.push(subDoc.slug)
        }
      }
    }
    return paths
  },
} satisfies Config
