import { Outlet, useLocation } from '@remix-run/react'
import { ModeToggle } from '~/components/dark-mode-toggle'

export default function Layout() {
  const pathname = useLocation().pathname

  return (
    <div className="grid grid-rows-[auto_1fr_auto]">
      <header className="flex items-center px-4 py-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Remix ドキュメント日本語版</h1>
          <ModeToggle />
        </div>
        <div className="flex-1" />
        <a
          className="hover text-sm hover:underline"
          href={`https://remix.run/docs${pathname}`}
        >
          English
        </a>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="mx-4 my-2 text-center">
        Docs and examples{' '}
        <a
          href="https://github.com/coji/remix-docs-ja/blob/main/LICENSE"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          licensed under MIT.
        </a>
      </footer>
    </div>
  )
}
