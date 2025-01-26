import { ChevronDown } from 'lucide-react'
import React from 'react'
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui'
import { cn } from '~/libs/utils'
import type { MenuDoc } from '~/services/menu.server'

import { SideMenuItem, SideMenuNavLink } from './side-menu'
interface MobileMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  menu: MenuDoc[]
  currentMenuItem?: MenuDoc
}

export const MobileMenu = ({ menu, currentMenuItem }: MobileMenuProps) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="flex max-h-dvh flex-col overflow-auto border-y md:hidden">
      <Button
        type="button"
        variant="ghost"
        className="text-muted-foreground hover:bg-muted flex flex-1 justify-between px-4 py-1 text-base whitespace-normal transition-all [&[data-state=open]>svg]:rotate-180"
        data-state={isOpen ? 'open' : 'closed'}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {currentMenuItem?.attrs.title}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
      </Button>

      {isOpen && (
        <div>
          {menu.map((category) => {
            return (
              <Collapsible
                key={category.slug}
                defaultOpen
                className="group border-none"
              >
                <CollapsibleTrigger
                  className={cn(
                    'text-muted-foreground w-full px-4 py-1 text-left text-base',
                  )}
                >
                  {category.attrs.title}
                </CollapsibleTrigger>
                <CollapsibleContent className="flex flex-col gap-1">
                  {category.children.map((menuItem) => {
                    return (
                      <SideMenuItem
                        key={menuItem.slug}
                        className={cn(
                          'text-muted-foreground aria-[current]:font-bold',
                        )}
                      >
                        {menuItem.children.length > 0 ? (
                          <div className="pl-4">{menuItem.attrs.title}</div>
                        ) : (
                          <SideMenuNavLink
                            className="block pl-4 text-base aria-[current]:text-white"
                            to={`${menuItem.slug}`}
                            prefetch="viewport"
                            onClick={() => setIsOpen(false)}
                          >
                            {menuItem.attrs.title}
                          </SideMenuNavLink>
                        )}

                        {menuItem.children.map((subMenuItem) => {
                          return (
                            <SideMenuItem
                              key={subMenuItem.slug}
                              className="pl-8"
                            >
                              <SideMenuNavLink
                                to={`${subMenuItem.slug}`}
                                prefetch="viewport"
                                onClick={() => setIsOpen(false)}
                              >
                                {subMenuItem.attrs.title}
                              </SideMenuNavLink>
                            </SideMenuItem>
                          )
                        })}
                      </SideMenuItem>
                    )
                  })}
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>
      )}
    </div>
  )
}
