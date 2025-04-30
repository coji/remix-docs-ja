import { NavLink } from 'react-router'
import { twc } from 'react-twc'

export const NavTabs = twc.div`-mb-px flex gap-2`

export const NavTab = twc(NavLink)`
border-transparent text-muted-foreground
hover:border-foreground/70 hover:text-foreground/70
whitespace-nowrap border-b-2 px-1 text-sm font-medium
aria-[current]:border-primary
aria-[current]:text-primary
`
