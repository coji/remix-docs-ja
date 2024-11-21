import { PageLoadingProgress } from '@remix-docs-ja/base/components/page-loading-progress'
import { ThemeProvider } from '@remix-docs-ja/base/components/theme-provider'
import { getProduct } from '@remix-docs-ja/base/features/product'
import { buildPageMeta } from '@remix-docs-ja/base/libs/seo'
import globalStyles from '@remix-docs-ja/base/styles/globals.css?url'
import type { LinksFunction } from 'react-router'
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import type { Route } from './+types/root'

export const meta = ({ data }: Route.MetaArgs) => {
  return buildPageMeta({
    title: data?.product.title,
    pathname: '/',
    productId: data?.product.id,
  })
}

export const loader = ({ request }: Route.LoaderArgs) => {
  const { product } = getProduct(request)
  return { product }
}

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: globalStyles },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning={true}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <PageLoadingProgress />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
