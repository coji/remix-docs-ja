import type { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, type MetaFunction } from '@remix-run/react'
import { ChevronDown } from 'lucide-react'
import React, { useEffect } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion'
import { Button } from '~/components/ui/button'
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
  const { menu, currentMenuItem, doc } = useLoaderData<typeof loader>()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [mobileMenuValue, setMobileMenuValue] = React.useState<string[]>(
    currentMenuItem?.parentSlug ? [currentMenuItem.parentSlug] : [],
  )

  useEffect(() => {
    if (currentMenuItem?.parentSlug) {
      setMobileMenuValue([currentMenuItem.parentSlug])
    }
    setMobileMenuOpen(false)
  }, [currentMenuItem])

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

      <div className="flex flex-col border-y md:hidden">
        <Button
          variant="ghost"
          className="justify-between [&[data-state=open]>svg]:rotate-180"
          data-state={mobileMenuOpen ? 'open' : 'closed'}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {currentMenuItem?.attrs.title}
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
        </Button>
        {mobileMenuOpen && (
          <Accordion
            type="multiple"
            value={mobileMenuValue}
            onValueChange={setMobileMenuValue}
          >
            {menu.map((category) => {
              return (
                <AccordionItem
                  key={category.slug}
                  value={category.slug}
                  className="border-none"
                >
                  <AccordionTrigger className="px-4 py-1 text-sm hover:bg-muted">
                    {category.attrs.title}
                  </AccordionTrigger>
                  <AccordionContent className="mx-4">
                    {category.children.map((menuItem) => {
                      return (
                        <SideMenuItem key={menuItem.slug}>
                          <SideMenuNavLink to={`/${menuItem.slug}`}>
                            {menuItem.attrs.title}
                          </SideMenuNavLink>
                        </SideMenuItem>
                      )
                    })}
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        )}
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
