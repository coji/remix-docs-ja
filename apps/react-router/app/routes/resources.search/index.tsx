import { getProductById } from '@remix-docs-ja/scripts/services/product'
import React, { useCallback } from 'react'
import { data, Link, useFetcher } from 'react-router'
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
import type { Route } from './+types'
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
import { search } from './search-bm25'

// Compatibility interface for existing UI
interface CompatibleSearchResult {
  url: string
  meta: {
    title: string
  }
}

export const loader = () => {
  return Response.json({})
}

export const clientLoader = async ({ request }: Route.ClientLoaderArgs) => {
  const product = getProductById(__PRODUCT_ID__)
  if (!product) {
    throw data('Product not found', { status: 404 })
  }
  const url = new URL(request.url)
  const query = url.searchParams.get('q')
  if (!query) return { results: [] }

  try {
    // Call our BM25 search API
    const data = await search({ query, limit: 10 })

    // Convert BM25 results to Pagefind-compatible format for existing UI
    const compatibleResults: CompatibleSearchResult[] = data.results.map(
      (result) => ({
        url: result.path,
        meta: {
          title: result.title,
        },
      }),
    )

    return { results: compatibleResults }
  } catch (error) {
    console.error('Search error:', error)
    // Fallback to empty results
    return { results: [] }
  }
}
clientLoader.hydrate = true

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
