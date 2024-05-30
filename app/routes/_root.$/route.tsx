import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, type MetaFunction } from '@remix-run/react'
import { buildPageMeta } from '~/libs/seo'
import markdownStyles from '~/styles/md.css?url'
import { buildMenu, getCurrentMenuItem } from '../_root/functions/build-menu'
import { getDoc } from './functions/get-doc'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: markdownStyles },
]

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.currentMenuItem) {
    return [{ title: 'Remix ドキュメント日本語版' }]
  }

  return buildPageMeta(
    data.currentMenuItem.attrs.title,
    data.currentMenuItem.slug,
  )
}

export const loader = async ({ params, response }: LoaderFunctionArgs) => {
  const filename = params['*'] ?? 'index'
  const doc = await getDoc(filename)
  const menu = await buildMenu()
  const currentMenuItem = getCurrentMenuItem(menu, filename) ?? {
    attrs: { title: 'Remix ドキュメント' },
    slug: '',
    children: [],
    hasContent: false,
    filename: 'index',
  }

  if (response) {
    response.headers.set(
      'Cache-Control',
      's-maxage=600, stale-while-revalidate=120',
    )
  }
  return { menu, currentMenuItem, doc }
}

export default function Docs() {
  const { doc } = useLoaderData<typeof loader>()

  return (
    <div
      className="md-prose prose px-4 py-8 dark:prose-invert md:py-2"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
      dangerouslySetInnerHTML={{ __html: doc.html }}
    />
  )
}
