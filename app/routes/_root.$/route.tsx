import type { LoaderFunctionArgs } from '@remix-run/node'
import { NavLink, useLoaderData } from '@remix-run/react'
import { buildMenu } from './functions/build-menu'
import { getDoc } from './functions/get-doc'

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const filename = params['*'] ?? 'index'
  const doc = await getDoc(filename)
  const menu = await buildMenu()
  return { menu, doc }
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
