import type { LoaderFunction } from 'react-router'

export const loader: LoaderFunction = ({ request }) => {
  return new Response('OK')
}
