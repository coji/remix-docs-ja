import { getProduct } from '~/features/product'
import { getMenu } from '~/services/menu.server'
import type * as Route from './+types.sitemap[.]xml'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { product } = getProduct(request)
  const host =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') ?? 'https'
  const siteRoot = `${proto}://${host}/`
  const menu = (await getMenu(product.id))
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
