import { Outlet } from '@remix-run/react'
import { ModeToggle } from '~/components/dark-mode-toggle'

export default function Layout() {
  return (
    <>
      <header>
        Remix Docs Ja
        <ModeToggle />
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="mx-4 my-2">
        &copy; Shopify, Inc. • Docs and examples licensed under MIT
      </footer>
    </>
  )
}
