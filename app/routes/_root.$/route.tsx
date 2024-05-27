import type { LoaderFunctionArgs } from '@remix-run/node'
import { NavLink, useLoaderData, type MetaFunction } from '@remix-run/react'
import { buildPageMeta } from '~/libs/seo'
import { buildMenu, getCurrentMenuItem } from './functions/build-menu'
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
  const currentMenuItem = getCurrentMenuItem(menu, filename)

  if (response) {
    response.headers.set(
      'Cache-Control',
      's-maxage=600, stale-while-revalidate=120',
    )
  }
  return { menu, currentMenuItem, doc }
}

export default function Docs() {
  const { menu, doc } = useLoaderData<typeof loader>()
  return (
    <div className="grid grid-cols-[16rem_1fr] gap-4">
      <div className="mx-4 flex flex-col gap-4">
        {menu.map((category) => {
          return (
            <div key={category.slug} className="group">
              <div className="text-muted-foreground">
                {category.attrs.title}
              </div>

              {category.children.map((menuItem) => {
                return (
                  <div className="ml-4 leading-6" key={menuItem.slug}>
                    <NavLink
                      to={`/${menuItem.slug}`}
                      prefetch="intent"
                      className="text-sm text-muted-foreground hover:underline aria-[current='page']:font-bold aria-[current='page']:text-foreground"
                    >
                      {menuItem.attrs.title}
                    </NavLink>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      <div
        className="prose mx-4 my-2 dark:prose-invert"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
        dangerouslySetInnerHTML={{
          __html: doc.html,
        }}
      />
    </div>
  )
}
