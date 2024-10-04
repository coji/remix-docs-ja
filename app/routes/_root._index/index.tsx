import type { LinksFunction } from 'react-router'
import Page, { loader } from '~/routes/_root.$'
import markdownStyles from '~/styles/md.css?url'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: markdownStyles },
]

export { loader }
export default Page
