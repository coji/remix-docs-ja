import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { configDefaults } from 'vitest/config'

export default defineConfig({
  optimizeDeps: { exclude: ['projects'] },
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths({
      skip: (dir) => dir.includes('projects') || dir.includes('node_modules'),
    }),
  ],
  server: {
    port: 5170,
  },
  test: { exclude: [...configDefaults.exclude, 'projects'] },
})
