import { useEffect } from 'react'
import type { LoaderFunctionArgs } from 'react-router'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  data,
  useLoaderData,
} from 'react-router'
import { getToast } from 'remix-toast'
import { toast } from 'sonner'
import { match } from 'ts-pattern'
import { Toaster } from '~/components/ui'
import globalStyles from './styles/globals.css?url'

export const links = () => [{ rel: 'stylesheet', href: globalStyles }]

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { toast, headers } = await getToast(request)
  return data({ toastData: toast }, { headers })
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  const { toastData } = useLoaderData<typeof loader>()

  useEffect(() => {
    if (!toastData) return
    const toastFn = match(toastData.type)
      .with('info', () => toast.info)
      .with('warning', () => toast.warning)
      .with('error', () => toast.error)
      .with('success', () => toast.success)
      .exhaustive()
    toastFn(toastData.message, {
      description: toastData.description,
      position: 'bottom-right',
    })
  }, [toastData])

  return (
    <>
      <Toaster closeButton richColors />
      <Outlet />
    </>
  )
}
