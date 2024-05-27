import { NavLink } from '@remix-run/react'
import { twc } from 'react-twc'

export const SideMenu = twc.div`mx-4 flex flex-col gap-4 text-sm text-muted-foreground break-words`
export const SideMenuCategory = twc.div`mx-2 group`
export const SideMenuCategoryTitle = twc.div`my-1 px-2 py-1`
export const SideMenuItem = twc.div`ml-4 leading-6`
export const SideMenuNavLink = twc(NavLink).attrs({
  prefetch: 'intent',
})`hover:underline aria-[current='page']:font-bold aria-[current='page']:text-foreground`
