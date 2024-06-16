import {
  Link,
  useFetcher,
  type ClientLoaderFunctionArgs,
} from '@remix-run/react'
import React, { useCallback } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  HStack,
  Input,
} from '~/components/ui'
import type { Pagefind } from '~/services/pagefind.types'
import {
  SearchLoading,
  SearchResult,
  SearchResultDescription,
  SearchResultList,
  SearchResultListItem,
  SearchResultTitle,
  SearchTrigger,
} from './components'
import { useHotkey } from './hooks'

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

  useHotkey(
    'k',
    useCallback(() => {
      setIsOpen(true)
    }, []),
  )

  return (
    <div>
      <SearchTrigger onClick={() => setIsOpen(true)} />

      <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <DialogContent className="p-4">
          <DialogHeader>
            <fetcher.Form action="/resources/search">
              <HStack>
                <Input id="query" name="q" placeholder="Search..." />
                <Button size="sm">Search</Button>
              </HStack>
            </fetcher.Form>
          </DialogHeader>

          <SearchResult>
            {fetcher.state === 'loading' && <SearchLoading />}
            {fetcher.data && (
              <SearchResultList>
                {fetcher.data.results.map((result) => (
                  <SearchResultListItem key={`${query}_${result.url}`}>
                    <Link to={result.url} onClick={() => setIsOpen(false)}>
                      <SearchResultTitle>{result.meta.title}</SearchResultTitle>
                      <SearchResultDescription>
                        {result.url}
                      </SearchResultDescription>
                    </Link>
                  </SearchResultListItem>
                ))}
              </SearchResultList>
            )}
          </SearchResult>
        </DialogContent>
      </Dialog>
    </div>
  )
}
