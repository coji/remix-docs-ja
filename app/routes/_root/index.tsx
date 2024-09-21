import type { LoaderFunctionArgs } from '@remix-run/node'
import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useRouteLoaderData,
} from '@remix-run/react'
import { ModeToggle } from '~/components/dark-mode-toggle'
import { HStack } from '~/components/ui/stack'
import { getProduct } from '~/features/product'
import type { loader as rootLoader } from '~/root'
import { SearchPanel } from '~/routes/resources.search'
import { getCurrentMenuItem, getMenu } from '~/services/menu.server'
import { MobileMenu, SideMenu } from './components'
export const shouldRevalidate = () => true

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { product } = getProduct(request)
  const url = new URL(request.url)
  const filename = `docs/${product.id}${url.pathname === '/' ? '/index.md' : url.pathname}.md`
  const menu = await getMenu(product.id)
  const currentMenuItem = getCurrentMenuItem(menu, filename) ?? {
    attrs: { title: product.title },
    slug: '',
    children: [],
    hasContent: false,
    filename: `docs/${product.id}/index.md`,
  }
  return { menu, currentMenuItem }
}

export default function Layout() {
  const { menu, currentMenuItem } = useLoaderData<typeof loader>()
  const { pathname } = useLocation()
  const rootLoaderData = useRouteLoaderData<typeof rootLoader>('root')

  const title = rootLoaderData?.product.title ?? 'Remixドキュメント日本語版'

  return (
    <div className="grid h-dvh grid-rows-[auto_1fr_auto] overflow-hidden lg:container">
      {/* header */}
      <header className="w-full bg-background text-foreground">
        <div className="flex items-center px-4 py-2">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">
              <Link to="/" prefetch="intent">
                {title}
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
            href={`https://remix.run/docs${pathname}`}
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
      <footer className="flex border-t px-4 py-1 text-sm text-muted-foreground">
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
            href={`https://github.com/coji/remix-docs-ja/edit/main/docs${pathname}.md`}
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
