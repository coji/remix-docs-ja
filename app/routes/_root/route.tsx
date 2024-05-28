import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, Outlet, useLoaderData, useLocation } from '@remix-run/react'
import { ModeToggle } from '~/components/dark-mode-toggle'
import { MobileMenu, SideMenu } from './components'
import { buildMenu, getCurrentMenuItem } from './functions/build-menu'

export const shouldRevalidate = () => true

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const filename = `docs${url.pathname === '/' ? '/index.md' : url.pathname}.md`
  const menu = await buildMenu()
  const currentMenuItem = getCurrentMenuItem(menu, filename) ?? {
    attrs: { title: 'Remix ドキュメント' },
    slug: '',
    children: [],
    hasContent: false,
    filename: 'docs/index.md',
  }
  return { menu, currentMenuItem }
}

export default function Layout() {
  const { menu, currentMenuItem } = useLoaderData<typeof loader>()
  const pathname = useLocation().pathname

  return (
    <div className="relative grid min-h-screen grid-rows-[auto_1fr_auto]">
      <header className="sticky top-0 z-10 bg-background ">
        <div className="flex items-center px-4 py-2">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">
              <Link to="/" prefetch="intent">
                Remix ドキュメント日本語版
              </Link>
            </h1>
            <ModeToggle />
          </div>
          <div className="flex-1" />
          <a
            className="hover text-sm hover:underline"
            href={`https://remix.run/docs${pathname}`}
          >
            English
          </a>
        </div>

        <MobileMenu menu={menu} currentMenuItem={currentMenuItem} />
      </header>

      <main className="grid grid-cols-1 gap-4 md:grid-cols-[16rem_1fr]">
        <SideMenu menu={menu} currentMenuItem={currentMenuItem} />
        <Outlet />
      </main>

      <footer className="mx-4 my-2 text-center text-muted-foreground">
        <div>
          Docs and examples{' '}
          <a
            href="https://github.com/coji/remix-docs-ja/blob/main/LICENSE"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            licensed under MIT.
          </a>
        </div>
        <div>
          <a
            href="https://github.com/coji/remix-docs-ja"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            View on GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
