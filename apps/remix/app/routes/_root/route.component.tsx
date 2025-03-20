import { Link, Outlet, useLocation, useRouteLoaderData } from 'react-router'
import { ModeToggle } from '~/components/dark-mode-toggle'
import { HStack } from '~/components/ui/stack'
import type { loader as rootLoader } from '~/root'
import { SearchPanel } from '../resources.search'
import type { Route } from './+types'
import { MobileMenu, SideMenu } from './components'

export default function Layout({
  loaderData: { menu, currentMenuItem },
}: Route.ComponentProps) {
  const { pathname } = useLocation()
  const rootLoaderData = useRouteLoaderData('root') as Awaited<
    ReturnType<typeof rootLoader>
  >

  const product = rootLoaderData.product
  const editUrl = `https://github.com/coji/remix-docs-ja/edit/main/docs/${__PRODUCT_ID__}${pathname === '/' ? '/index' : pathname}.md`

  return (
    <div className="grid h-dvh grid-rows-[auto_1fr_auto] overflow-hidden lg:container">
      {/* header */}
      <header className="bg-background text-foreground w-full">
        <div className="flex items-center px-4 py-2">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold break-keep">
              <Link to="/" prefetch="intent">
                {product.title}
              </Link>
            </h1>

            <HStack className="gap-2">
              <ModeToggle />
              <SearchPanel />
            </HStack>
          </div>

          <div className="flex-1" />

          <a
            className="hover ml-2 text-sm hover:underline"
            href={`${product.englishUrl}${pathname}`}
          >
            English
          </a>
        </div>
        <MobileMenu menu={menu} currentMenuItem={currentMenuItem} />
      </header>

      {/* main */}
      <div className="grid grid-cols-1 grid-rows-1 overflow-hidden md:grid-cols-[16rem_1fr]">
        <SideMenu menu={menu} />

        <main className="grid grid-cols-1 grid-rows-1">
          <Outlet />
        </main>
      </div>

      {/* footer */}
      <footer className="text-muted-foreground flex border-t px-4 py-1 text-sm">
        <div className="flex-1">
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
            href={editUrl}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Edit
          </a>
        </div>
      </footer>
    </div>
  )
}
