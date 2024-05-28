import type { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, type MetaFunction } from '@remix-run/react'
import { buildPageMeta } from '~/libs/seo'
import { buildMenu, getCurrentMenuItem } from '../_root/functions/build-menu'
import { getDoc } from './functions/get-doc'

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
      className="prose px-4 py-8 dark:prose-invert md:py-2"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
      dangerouslySetInnerHTML={{ __html: doc.html }}
    />
  )
}
