import { NavLink } from '@remix-run/react'
import { twc } from 'react-twc'
import { cn } from '~/libs/utils'
import type { MenuDoc } from '../types'
interface SideMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  menu: MenuDoc[]
  currentMenuItem?: MenuDoc
}
export const SideMenu = ({ menu, currentMenuItem }: SideMenuProps) => {
  return (
    <div className="mx-2 hidden flex-col gap-4 whitespace-normal break-words text-sm text-muted-foreground md:flex">
      {menu.map((category) => {
        return (
          <SideMenuCategory key={category.slug}>
            <SideMenuCategoryTitle
              className={cn(
                'rounded-md',
                category.slug === currentMenuItem?.parentSlug &&
                  'bg-muted font-bold',
              )}
            >
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
    </div>
  )
}
export const SideMenuCategory = twc.div`group`
export const SideMenuCategoryTitle = twc.div`my-1 px-2 py-1`
export const SideMenuItem = twc.div`ml-4 leading-6`
export const SideMenuNavLink = twc(NavLink).attrs({
  prefetch: 'intent',
})`hover:underline aria-[current='page']:font-bold aria-[current='page']:text-foreground`
