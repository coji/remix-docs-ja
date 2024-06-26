import { vitePlugin as remix } from '@remix-run/dev'
import { installGlobals } from '@remix-run/node'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

installGlobals({ nativeFetch: true })

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        unstable_singleFetch: true,
        unstable_fogOfWar: true,
      },
    }),
    tsconfigPaths(),
  ],
  build: { rollupOptions: { external: ['/pagefind/pagefind.js?url'] } },
})
