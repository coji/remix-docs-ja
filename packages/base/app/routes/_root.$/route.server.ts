import type { LinksFunction } from 'react-router'
import { getProduct } from '~/features/product'
import { buildPageMeta } from '~/libs/seo'
import { getDocJson } from '~/services/document.server'
import markdownStyles from '~/styles/md.css?url'
import type { Route } from './+types'

export const meta = ({ location, data }: Route.MetaArgs) => {
  if (!data) {
    return []
  }
  const { doc } = data
  return buildPageMeta({
    title: String(doc.attributes.title),
    pathname: location.pathname,
    productId: data.product.id,
  })
}

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: markdownStyles },
]

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const filename = params['*'] ?? 'index'
  const { product } = getProduct(request)
  const doc = await getDocJson(product.id, filename)
  if (!doc) {
    throw new Response('File not found', { status: 404 })
  }

  return { doc, product }
}
