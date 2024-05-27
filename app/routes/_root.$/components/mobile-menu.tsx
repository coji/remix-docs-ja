import { ChevronDown } from 'lucide-react'
import React, { useEffect } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion'
import { Button } from '~/components/ui/button'
import { cn } from '~/libs/utils'
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
        type="button"
        variant="ghost"
        className="flex justify-between whitespace-normal px-4 py-1 text-sm text-muted-foreground transition-all hover:bg-muted [&[data-state=open]>svg]:rotate-180"
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
                <AccordionTrigger
                  className={cn(
                    'px-4 py-1 text-sm text-muted-foreground  hover:bg-muted',
                    category.slug === currentMenuItem?.parentSlug &&
                      'bg-muted font-bold',
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
                          'text-muted-foreground hover:bg-muted',
                          menuItem.slug === currentMenuItem?.slug &&
                            'font-bold',
                        )}
                      >
                        <SideMenuNavLink
                          className="block pl-4"
                          to={`/${menuItem.slug}`}
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
