import { getProductById } from '@remix-docs-ja/scripts/services/product'
import { data } from 'react-router'
import { getCurrentMenuItem, getMenu } from '~/services/menu.server'
import type { Route } from './+types'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const product = getProductById(__PRODUCT_ID__)
  if (!product) {
    throw data('Product not found: __PRODUCT_ID__', { status: 404 })
  }
  const url = new URL(request.url)
  const filename = `docs/${product.id}${url.pathname === '/' ? '/index.md' : url.pathname}.md`
  const menu = await getMenu()
  const currentMenuItem = getCurrentMenuItem(menu, filename) ?? {
    attrs: { title: product.title },
    slug: '',
    children: [],
    hasContent: false,
    filename: `docs/${product.id}/index.md`,
  }
  return { menu, currentMenuItem }
}
