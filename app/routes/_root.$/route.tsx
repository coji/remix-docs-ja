import {
  unstable_defineLoader as defineLoader,
  type LinksFunction,
} from '@remix-run/node'
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from '@remix-run/react'
import { cn } from '~/libs/utils'
import { getDoc } from '~/services/document.server'
import markdownStyles from '~/styles/md.css?url'
import {
  TableOfContents,
  TableOfContentsItem,
  TableOfContentsTitle,
} from './components/toc'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: markdownStyles },
]
export const loader = defineLoader(async ({ params, response }) => {
  const filename = params['*'] ?? 'index'
  const doc = await getDoc(filename)
  if (!doc) {
    response.status = 404
    throw new Response('File not found', { status: 404 })
  }

  response.headers.set(
    'Cache-Control',
    's-maxage=600, stale-while-revalidate=120',
  )
  return { doc }
})

export default function Docs() {
  const { doc } = useLoaderData<typeof loader>()

  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-[auto_1fr]">
      <div
        className="md-prose prose mb-32 overflow-x-hidden px-4 py-8 dark:prose-invert md:py-2"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
        dangerouslySetInnerHTML={{ __html: doc.html }}
      />

      <div>
        {doc.headings.length > 0 && (
          <TableOfContents>
            <TableOfContentsTitle>目次</TableOfContentsTitle>
            {doc.headings.map((heading) => (
              <TableOfContentsItem
                key={heading.slug}
                className={cn(heading.headingLevel === 'h3' && 'ml-4')}
              >
                <a href={`#${heading.slug}`}>{heading.html}</a>
              </TableOfContentsItem>
            ))}
          </TableOfContents>
        )}
      </div>
    </div>
  )
}

export const ErrorBoundary = () => {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.data}
        </h1>
      </div>
    )
  }

  return (
    <div>
      <h1>Oops! An error occurred.</h1>
      <pre>{JSON.stringify(error)}</pre>
    </div>
  )
}
