import type { Config } from '@react-router/dev/config'
import { buildMenu } from '@remix-docs-ja/scripts/services/menu'

export default {
  ssr: false,
  prerender: async () => {
    const paths = ['/', '/sitemap.xml', '/resources/search']
    const categories = await buildMenu()
    const docPaths = categories
      .flatMap((category) => category.children)
      .map((doc) => doc.slug)
    return [...paths, ...docPaths]
  },
} satisfies Config
