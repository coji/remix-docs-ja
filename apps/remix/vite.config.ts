import mdx from '@mdx-js/rollup'
import { reactRouter } from '@react-router/dev/vite'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  define: {
    __PRODUCT_ID__: JSON.stringify('remix'),
  },
  plugins: [
    mdx({ remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter] }),
    reactRouter(),
    tsconfigPaths(),
  ],
  build: {
    rollupOptions: {
      external: '/pagefind/pagefind.js?url',
    },
  },
})
