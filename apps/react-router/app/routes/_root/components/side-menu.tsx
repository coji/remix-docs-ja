import { NavLink } from 'react-router'
import { twc } from 'react-twc'
import type { MenuDoc } from '~/services/menu.server'

interface SideMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  menu: MenuDoc[]
}
export const SideMenu = ({ menu }: SideMenuProps) => {
  return (
    <SideMenuContainer>
      {menu.map((category) => {
        return (
          <SideMenuCategory key={category.slug}>
            <SideMenuCategoryTitle>
              {category.attrs.title}
            </SideMenuCategoryTitle>

            <SideMenuContent>
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

                    {menuItem.children.length > 0 && (
                      <SideMenuSubContent>
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
                      </SideMenuSubContent>
                    )}
                  </SideMenuItem>
                )
              })}
            </SideMenuContent>
          </SideMenuCategory>
        )
      })}
    </SideMenuContainer>
  )
}

export const SideMenuContainer = twc.div`bg-background text-muted-foreground mx-2 hidden flex-col gap-4 overflow-auto pb-8 text-sm break-words whitespace-normal md:flex`
export const SideMenuCategory = twc.div`group font-medium`
export const SideMenuCategoryTitle = twc.div`px-2 py-1 group-has-[.active]:bg-blue-50 group-has-[.active]:text-blue-700 rounded-md group-has-[.active]:font-bold`
export const SideMenuContent = twc.div`grid gap-2 py-2`
export const SideMenuSubContent = twc.div`grid gap-2 py-2`
export const SideMenuItem = twc.div`pl-4`
export const SideMenuNavLink = twc(NavLink).attrs({
  prefetch: 'intent',
})`hover:underline aria-[current]:text-blue-700`
