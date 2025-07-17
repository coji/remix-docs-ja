import { getProductById } from '@remix-docs-ja/scripts/services/product'
import {
  data,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router'
import type { Route } from './+types/root'
import { PageLoadingProgress } from './components/page-loading-progress'
import { ThemeProvider } from './components/theme-provider'
import { buildPageMeta } from './libs/seo'
import './styles/globals.css'

export const meta = ({ data }: Route.MetaArgs) => {
  return buildPageMeta({
    title: data?.product.title,
    pathname: '/',
    productId: data?.product.id,
  })
}

export const loader = () => {
  const product = getProductById(__PRODUCT_ID__)
  if (!product) {
    throw data('Product not found: __PRODUCT_ID__', { status: 404 })
  }
  return { product }
}

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
