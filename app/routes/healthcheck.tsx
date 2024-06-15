import type { LoaderFunction } from '@remix-run/node'

export const loader: LoaderFunction = ({ request }) => {
  return new Response('OK')
}
