import { data } from 'react-router'
import { getProductById } from '~/features/product'
import { getMenu } from '~/services/menu.server'
import type { Route } from './+types/sitemap[.]xml'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const product = getProductById(__PRODUCT_ID__)
  if (!product) {
    throw data('Product not found', { status: 404 })
  }

  const siteRoot = product.url
  const menu = (await getMenu())
    .flatMap((doc) => doc.children)
    .filter((doc) => doc.hasContent && doc.children.length === 0)

  const content = `
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${siteRoot}</loc>
        <priority>1.0</priority>
      </url>
      ${menu
        .map((doc) => {
          return `<url><loc>${siteRoot}${doc.slug}</loc></url>`
        })
        .join('\n')}
    </urlset>
  `

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'xml-version': '1.0',
      encoding: 'UTF-8',
    },
  })
}
