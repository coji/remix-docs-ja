import { data } from 'react-router'
import { getProductById } from '~/features/product'
import { getDocJson } from '~/services/document.server'
import type { Route } from './+types'

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const filename = params['*'] ?? 'index'
  const product = getProductById(__PRODUCT_ID__)
  if (!product) {
    throw data('Product not found: __PRODUCT_ID__', { status: 404 })
  }
  const doc = await getDocJson(product.id, filename)
  if (!doc) {
    throw data(`File not found: ${filename}`, { status: 404 })
  }

  return { doc, product }
}
