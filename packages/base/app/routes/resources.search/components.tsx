import { CommandIcon, LoaderIcon, SearchIcon } from 'lucide-react'
import { twc } from 'react-twc'
import { Button, HStack, type ButtonProps } from '~/components/ui'
import { cn } from '~/libs/utils'

export const SearchTrigger = twc(({ className, ...rest }: ButtonProps) => {
  return (
    <Button
      variant="outline"
      className={cn(
        'md:inline-flex md:w-48 md:gap-2 md:bg-muted md:px-3 md:text-muted-foreground',
        className,
      )}
      size="icon"
      type="button"
      {...rest}
    >
      <SearchIcon size="16" />
      <div className="hidden flex-1 text-left md:block">Search...</div>
      <HStack className="hidden gap-1 md:flex">
        <Hotkey>
          <CommandIcon size="12" />
        </Hotkey>
        <Hotkey>K</Hotkey>
      </HStack>
    </Button>
  )
})``

export const SearchResult = twc.div`max-h-96 overflow-auto`
export const SearchLoading = twc(({ ...rest }) => (
  <div {...rest}>
    <LoaderIcon size="16" className="mx-auto animate-spin" />
  </div>
))`my-2 text-center`
export const SearchResultList = twc.ul``
export const SearchResultListItem = twc.li`hover:bg-muted rounded p-2`
export const SearchResultTitle = twc.div``
export const SearchResultDescription = twc.div`text-xs text-muted-foreground`

export const Hotkey = twc.div`h-5 w-5 rounded-md bg-card grid place-content-center`
