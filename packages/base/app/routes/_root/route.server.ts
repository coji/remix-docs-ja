import { getProduct } from '~/features/product'
import { getCurrentMenuItem, getMenu } from '~/services/menu.server'
import type { Route } from './+types'

export const shouldRevalidate = () => true

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { product } = getProduct(request)
  const url = new URL(request.url)
  const filename = `docs/${product.id}${url.pathname === '/' ? '/index.md' : url.pathname}.md`
  const menu = await getMenu(product.id)
  const currentMenuItem = getCurrentMenuItem(menu, filename) ?? {
    attrs: { title: product.title },
    slug: '',
    children: [],
    hasContent: false,
    filename: `docs/${product.id}/index.md`,
  }
  return { menu, currentMenuItem }
}
