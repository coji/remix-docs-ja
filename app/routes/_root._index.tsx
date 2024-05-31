import type { LinksFunction } from '@remix-run/node'
import markdownStyles from '~/styles/md.css?url'
import Page, { loader } from './_root.$/route'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: markdownStyles },
]

export { loader }
export default Page
