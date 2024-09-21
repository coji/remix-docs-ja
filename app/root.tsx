import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import { PageLoadingProgress } from './components/page-loading-progress'
import { ThemeProvider } from './components/theme-provider'
import { getProduct } from './features/product'
import { buildPageMeta } from './libs/seo'
import globalStyles from './styles/globals.css?url'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return buildPageMeta({ title: data?.product.title, pathname: '/' })
}

export const loader = ({ request }: LoaderFunctionArgs) => {
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
