import { NavLink } from 'react-router'
import { twc } from 'react-twc'
import type { MenuDoc } from '~/services/menu.server'

interface SideMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  menu: MenuDoc[]
}
export const SideMenu = ({ menu }: SideMenuProps) => {
  return (
    <div className="bg-background text-muted-foreground mx-2 hidden flex-col gap-4 overflow-auto pb-8 text-sm break-words whitespace-normal md:flex">
      {menu.map((category) => {
        return (
          <SideMenuCategory key={category.slug}>
            <SideMenuCategoryTitle className="group-has-[.active]:bg-muted rounded-md group-has-[.active]:font-bold">
              {category.attrs.title}
            </SideMenuCategoryTitle>

            {category.children.map((menuItem) => {
              return (
                <SideMenuItem key={menuItem.slug}>
                  {menuItem.children.length > 0 ? (
                    <div>{menuItem.attrs.title}</div>
                  ) : (
                    <SideMenuNavLink
                      to={`${menuItem.slug}`}
                      prefetch="viewport"
                    >
                      {menuItem.attrs.title}
                    </SideMenuNavLink>
                  )}

                  {menuItem.children.map((subMenuItem) => {
                    return (
                      <SideMenuItem key={subMenuItem.slug}>
                        <SideMenuNavLink
                          to={`${subMenuItem.slug}`}
                          prefetch="viewport"
                        >
                          {subMenuItem.attrs.title}
                        </SideMenuNavLink>
                      </SideMenuItem>
                    )
                  })}
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
export const SideMenuItem = twc.div`pl-4 leading-loose`
export const SideMenuNavLink = twc(NavLink).attrs({
  prefetch: 'intent',
})`hover:underline aria-[current]:font-bold aria-[current]:text-foreground`
