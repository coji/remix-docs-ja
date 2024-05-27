import type { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, type MetaFunction } from '@remix-run/react'
import { buildPageMeta } from '~/libs/seo'
import {
  SideMenu,
  SideMenuCategory,
  SideMenuCategoryTitle,
  SideMenuItem,
  SideMenuNavLink,
} from './components'
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[16rem_1fr]">
      <SideMenu className="hidden whitespace-normal md:flex">
        {menu.map((category) => {
          return (
            <SideMenuCategory key={category.slug}>
              <SideMenuCategoryTitle>
                {category.attrs.title}
              </SideMenuCategoryTitle>

              {category.children.map((menuItem) => {
                return (
                  <SideMenuItem key={menuItem.slug}>
                    <SideMenuNavLink to={`/${menuItem.slug}`}>
                      {menuItem.attrs.title}
                    </SideMenuNavLink>
                  </SideMenuItem>
                )
              })}
            </SideMenuCategory>
          )
        })}
      </SideMenu>

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
