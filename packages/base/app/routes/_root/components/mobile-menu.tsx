import { ChevronDown } from 'lucide-react'
import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion'
import { Button } from '~/components/ui/button'
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
        className="flex flex-1 justify-between whitespace-normal px-4 py-1 text-base text-muted-foreground transition-all hover:bg-muted [&[data-state=open]>svg]:rotate-180"
        data-state={isOpen ? 'open' : 'closed'}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {currentMenuItem?.attrs.title}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
      </Button>

      {isOpen && (
        <Accordion
          type="multiple"
          defaultValue={
            currentMenuItem?.parentSlug ? [currentMenuItem.parentSlug] : []
          }
        >
          {menu.map((category) => {
            return (
              <AccordionItem
                key={category.slug}
                value={category.slug}
                className="group border-none"
              >
                <AccordionTrigger
                  className={cn(
                    'px-4 py-1 text-base text-muted-foreground',
                    'group-has-[.active]:bg-muted group-has-[.active]:font-bold',
                  )}
                >
                  {category.attrs.title}
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-1">
                  {category.children.map((menuItem) => {
                    return (
                      <SideMenuItem
                        key={menuItem.slug}
                        className={cn(
                          'text-muted-foreground aria-[current]:font-bold',
                        )}
                      >
                        <SideMenuNavLink
                          className="block pl-4 text-base"
                          to={`/${menuItem.slug}`}
                          onClick={() => setIsOpen(false)}
                        >
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
  )
}
