import {
  Link,
  useFetcher,
  type ClientLoaderFunctionArgs,
} from '@remix-run/react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { HStack } from '~/components/ui/stack'
import type { Pagefind } from '~/services/pagefind.types'

export const clientLoader = async ({
  request,
  params,
}: ClientLoaderFunctionArgs) => {
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
clientLoader.hydrate = true

export const SearchPanel = () => {
  const fetcher = useFetcher<typeof clientLoader>()
  const query = String(fetcher.formData?.get('q'))
  return (
    <div className="relative">
      <fetcher.Form action="/resources/search">
        <HStack className="items-center">
          <Input id="query" name="q" placeholder="Search..." />
          <Button size="sm">Search</Button>
        </HStack>
      </fetcher.Form>

      {fetcher.data && (
        <ul className="absolute left-0 right-0 top-full z-10 rounded-md border bg-card px-4 py-2 drop-shadow-lg">
          {fetcher.data.results.slice(0, 10).map((result) => (
            <li key={`${query}_${result.url}`} className="flex flex-col gap-4">
              <Link to={result.url}>
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
  )
}
