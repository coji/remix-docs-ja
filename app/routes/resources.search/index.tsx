import React, { useCallback } from 'react'
import { Link, useFetcher } from 'react-router'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  HStack,
  Input,
} from '~/components/ui'
import { getProduct } from '~/features/product'
import type { Pagefind } from '~/services/pagefind.types'
import type * as Route from './+types.index'
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

export const clientLoader = async ({ request }: Route.ClientLoaderArgs) => {
  const { product } = getProduct(request)
  const url = new URL(request.url)
  const query = url.searchParams.get('q')
  if (!query) return { results: [] }

  const pagefind = (await import(
    /* @vite-ignore */ product.pagefind
  )) as unknown as Pagefind
  await pagefind.init()
  const ret = await pagefind.search(query)
  const results = await Promise.all(ret.results.map((result) => result.data()))
  return { results }
}

export const SearchPanel = () => {
  const fetcher = useFetcher<Route.LoaderData>()
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
            <DialogTitle>
              <fetcher.Form action="/resources/search">
                <HStack>
                  <Input id="query" name="q" placeholder="Search..." />
                  <Button size="sm">Search</Button>
                </HStack>
              </fetcher.Form>
            </DialogTitle>
            <DialogDescription />
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
