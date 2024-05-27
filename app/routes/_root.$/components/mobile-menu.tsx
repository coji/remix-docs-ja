import { ChevronDown } from 'lucide-react'
import React, { useEffect } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion'
import { Button } from '~/components/ui/button'
import type { MenuDoc } from '../types'
import { SideMenuItem, SideMenuNavLink } from './side-menu'
interface MobileMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  menu: MenuDoc[]
  currentMenuItem?: MenuDoc
}

export const MobileMenu = ({ menu, currentMenuItem }: MobileMenuProps) => {
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
  )
}
