import {
  Link,
  useFetcher,
  type ClientLoaderFunctionArgs,
} from '@remix-run/react'
import { CommandIcon, LoaderIcon, SearchIcon } from 'lucide-react'
import React from 'react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { HStack } from '~/components/ui/stack'
import type { Pagefind } from '~/services/pagefind.types'

export const clientLoader = async ({ request }: ClientLoaderFunctionArgs) => {
  const url = new URL(request.url)
  const search = url.searchParams.get('q')
  if (!search) return { results: [] }

  const pagefind = (await import(
    '/pagefind/pagefind.js?url'
  )) as unknown as Pagefind
  await pagefind.init()
  const ret = await pagefind.search(search)
  const results = await Promise.all(ret.results.map((result) => result.data()))
  return { results }
}

export const SearchPanel = () => {
  const fetcher = useFetcher<typeof clientLoader>()
  const [isOpen, setIsOpen] = React.useState(false)
  const query = String(fetcher.formData?.get('q'))

  const handleClickSearchInput = () => {
    setIsOpen(true)
  }

  return (
    <div>
      <Button
        variant="outline"
        className="md:inline-flex md:w-48 md:gap-2 md:bg-muted md:px-3 md:text-muted-foreground"
        size="icon"
        onClick={handleClickSearchInput}
      >
        <SearchIcon size="16" />
        <div className="hidden md:block">Search...</div>
        <div className="hidden flex-1 md:block" />
        <div className="hidden h-5 w-5 rounded-md bg-card md:grid md:place-content-center">
          <CommandIcon size="12" />
        </div>
        <div className="hidden h-5 w-5 rounded-md bg-card md:grid md:place-content-center">
          K
        </div>
      </Button>

      <Dialog
        open={isOpen}
        modal={true}
        onOpenChange={(open) => setIsOpen(open)}
      >
        <DialogContent className="p-4">
          <DialogHeader>
            <fetcher.Form action="/resources/search">
              <HStack className="items-center">
                <Input id="query" name="q" placeholder="Search..." />
                <Button size="sm">Search</Button>
              </HStack>
            </fetcher.Form>
          </DialogHeader>

          <div className="max-h-96 overflow-auto">
            {fetcher.state === 'loading' && (
              <div className="mx-auto text-center">
                <LoaderIcon size="16" className="block animate-spin">
                  Loading...
                </LoaderIcon>
              </div>
            )}
            {fetcher.data && (
              <ul>
                {fetcher.data.results.map((result) => (
                  <li
                    key={`${query}_${result.url}`}
                    className="flex flex-col gap-4"
                  >
                    <Link to={result.url} onClick={() => setIsOpen(false)}>
                      <div>{result.meta.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {result.url}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
