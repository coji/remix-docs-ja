import mdx from '@mdx-js/rollup'
import { reactRouter } from '@react-router/dev/vite'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { products } from './app/features/product/products'

export default defineConfig({
  plugins: [
    mdx({ remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter] }),
    reactRouter(),
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
