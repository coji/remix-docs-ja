import { ChevronDown } from 'lucide-react'
import React from 'react'
import { twc } from 'react-twc'
import { Button } from '~/components/ui/button'
import { cn } from '~/libs/utils'

export const SideMenuCategory = twc.div`group`
export const SideMenuCategoryTitle = twc.div`px-2 py-1`
export const SideMenuItem = twc.div`pl-4 leading-6`
export const SideMenuNavLink = twc.a`hover:underline aria-[current]:font-bold aria-[current]:text-foreground`

interface MobileTocProps {
  headings: { slug?: string; headingLevel: string; html: string }[]
}
export const MobileToc = ({ headings }: MobileTocProps) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="sticky top-0 max-h-dvh flex-col overflow-auto border-b md:hidden">
      <Button
        type="button"
        variant="ghost"
        className="flex h-auto w-full flex-1 justify-between whitespace-normal px-4 py-1 text-base text-muted-foreground transition-all hover:bg-muted [&[data-state=open]>svg]:rotate-180"
        data-state={isOpen ? 'open' : 'closed'}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        目次
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
      </Button>

      {isOpen && (
        <div className="flex flex-col gap-1">
          {headings.map((heading) => {
            return (
              <SideMenuItem
                key={heading.slug}
                className={cn('text-muted-foreground aria-[current]:font-bold')}
              >
                <SideMenuNavLink
                  className="block pl-4 text-base"
                  href={`#${heading.slug}`}
                  onClick={() => setIsOpen(false)}
                >
                  {heading.html}
                </SideMenuNavLink>
              </SideMenuItem>
            )
          })}
        </div>
      )}
    </div>
  )
}
