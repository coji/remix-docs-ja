import mdx from '@mdx-js/rollup'
import { vitePlugin as remix } from '@remix-run/dev'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { products } from './app/features/product/products'

declare module '@remix-run/server-runtime' {
  interface Future {
    unstable_singleFetch: true
  }
}

export default defineConfig({
  plugins: [
    mdx({ remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter] }),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        unstable_singleFetch: true,
        unstable_lazyRouteDiscovery: true,
        unstable_optimizeDeps: true,
      },
    }),
    tsconfigPaths(),
  ],
  build: {
    rollupOptions: {
      external: products.map((product) => {
        return `/pagefind/${product.id}/pagefind.js?url`
      }),
    },
  },
})
