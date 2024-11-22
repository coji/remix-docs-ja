import { NavLink } from 'react-router'
import { twc } from 'react-twc'
import type { MenuDoc } from '~/services/menu.server'

interface SideMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  menu: MenuDoc[]
}
export const SideMenu = ({ menu }: SideMenuProps) => {
  return (
    <div className="mx-2 hidden flex-col gap-4 overflow-auto whitespace-normal break-words bg-background pb-8 text-sm text-muted-foreground md:flex">
      {menu.map((category) => {
        return (
          <SideMenuCategory key={category.slug}>
            <SideMenuCategoryTitle className="rounded-md group-has-[.active]:bg-muted group-has-[.active]:font-bold">
              {category.attrs.title}
            </SideMenuCategoryTitle>

            {category.children.map((menuItem) => {
              return (
                <SideMenuItem key={menuItem.slug}>
                  <SideMenuNavLink to={`${menuItem.slug}`}>
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
export const SideMenuCategoryTitle = twc.div`px-2 py-1`
export const SideMenuItem = twc.div`pl-4 leading-6`
export const SideMenuNavLink = twc(NavLink).attrs({
  prefetch: 'intent',
})`hover:underline aria-[current]:font-bold aria-[current]:text-foreground`
