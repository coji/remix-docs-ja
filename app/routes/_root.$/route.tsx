import {
  unstable_defineLoader as defineLoader,
  type LinksFunction,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { cn } from '~/libs/utils'
import { getDoc } from '~/services/document.server'
import markdownStyles from '~/styles/md.css?url'
import { MobileToc } from './components/mobile-toc'
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
    <div className="relative grid max-h-full grid-cols-1 grid-rows-1 md:grid-cols-[auto_minmax(10rem,1fr)]">
      <div
        className="md-prose prose order-2 mb-32 scroll-pt-32 overflow-x-hidden scroll-smooth px-4 py-8 dark:prose-invert md:order-1 md:py-2"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
        dangerouslySetInnerHTML={{ __html: doc.html }}
      />

      <div className="sticky top-0 z-10 order-1 bg-card md:static md:inset-auto md:order-2 md:block">
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

        <MobileToc headings={doc.headings} />
      </div>
    </div>
  )
}
