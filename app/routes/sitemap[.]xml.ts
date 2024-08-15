import type { LoaderFunctionArgs } from '@remix-run/node'
import { getMenu } from '~/services/menu.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const host =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') ?? 'https'
  const siteRoot = `${proto}://${host}/`
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
