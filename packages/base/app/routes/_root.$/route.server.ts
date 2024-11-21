import { getProduct } from '~/features/product'
import { getDocJson } from '~/services/document.server'
import type { Route } from './+types'

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const filename = params['*'] ?? 'index'
  const { product } = getProduct(request)
  const doc = await getDocJson(product.id, filename)
  if (!doc) {
    throw new Response('File not found', { status: 404 })
  }

  return { doc, product }
}
