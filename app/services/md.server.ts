/*!
 * Forked from https://github.com/ryanflorence/md/blob/master/index.ts
 *
 * Adapted from
 * - ggoodman/nostalgie
 *   - MIT https://github.com/ggoodman/nostalgie/blob/45f3f6356684287a214dab667064ec9776def933/LICENSE
 *   - https://github.com/ggoodman/nostalgie/blob/45f3f6356684287a214dab667064ec9776def933/src/worker/mdxCompiler.ts
 */
import parseFrontMatter from 'front-matter'
import type * as Unified from 'unified'
import type * as Unist from 'unist'

export interface ProcessorOptions {
  resolveHref?(href: string): string
}

let processor: Awaited<ReturnType<typeof getProcessor>>
export async function processMarkdown(
  content: string,
  options?: ProcessorOptions,
) {
  processor = processor || (await getProcessor(options))
  const { attributes, body: raw } = parseFrontMatter(content)
  const vfile = await processor.process(raw)
  const html = vfile.value.toString()
  return { attributes, raw, html }
}

export async function getProcessor(options?: ProcessorOptions) {
  const [
    { unified },
    { default: remarkGfm },
    { default: remarkParse },
    { default: remarkRehype },
    { default: rehypeSlug },
    { default: rehypeStringify },
    { default: rehypeAutolinkHeadings },
    { default: rehypeRaw },
    { default: rehypeShiki },
    plugins,
  ] = await Promise.all([
    import('unified'),
    import('remark-gfm'),
    import('remark-parse'),
    import('remark-rehype'),
    import('rehype-slug'),
    import('rehype-stringify'),
    import('rehype-autolink-headings'),
    import('rehype-raw'),
    import('@shikijs/rehype'),
    loadPlugins(),
  ])

  return unified()
    .use(remarkParse)
    .use(plugins.stripLinkExtPlugin, options)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(plugins.addBaseUrl)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .use(rehypeRaw)
    .use(rehypeShiki, {
      theme: 'github-dark',
    })
}

type InternalPlugin<
  Input extends string | Unist.Node | undefined,
  Output,
> = Unified.Plugin<[ProcessorOptions?], Input, Output>

export async function loadPlugins() {
  const [{ visit, SKIP }, { htmlEscape }] = await Promise.all([
    import('unist-util-visit'),
    import('escape-goat'),
  ])

  const stripLinkExtPlugin: InternalPlugin<UnistNode.Root, UnistNode.Root> = (
    options = {},
  ) => {
    return async function transformer(tree: UnistNode.Root) {
      visit(tree, 'link', (node, index, parent) => {
        if (
          options.resolveHref &&
          typeof node.url === 'string' &&
          isRelativeUrl(node.url)
        ) {
          if (parent && index != null) {
            parent.children[index] = {
              ...node,
              url: options.resolveHref(node.url),
            }
            return SKIP
          }
        }
      })
    }
  }

  // 型定義
  interface ImgNode extends Element {
    properties: {
      src: string
    }
  }

  const addBaseUrl: InternalPlugin<UnistNode.Root, UnistNode.Root> = () => {
    return (tree: UnistNode.Root) => {
      visit(tree, 'element', (node) => {
        const element = node as unknown as ImgNode
        if (
          element.tagName === 'img' ||
          (element.tagName === 'iframe' &&
            element.properties &&
            element.properties.src)
        ) {
          const src = element.properties.src
          if (!src.startsWith('http://') && !src.startsWith('https://')) {
            element.properties.src = `https://remix.run${src}`
          }
        }
      })
    }
  }

  return {
    stripLinkExtPlugin,
    addBaseUrl,
  }
}

////////////////////////////////////////////////////////////////////////////////

function isRelativeUrl(test: string) {
  // Probably fragile but should work well enough.
  // It would be nice if the consumer could provide a baseURI we could do
  // something like:
  // new URL(baseURI).origin === new URL(test, baseURI).origin
  const regexp = /^(?:[a-z]+:)?\/\//i
  return !regexp.test(test)
}

////////////////////////////////////////////////////////////////////////////////

export namespace UnistNode {
  export type Content = Flow | Phrasing | Html
  export interface Root extends Unist.Parent {
    type: 'root'
    children: Flow[]
  }

  export type Flow =
    | Blockquote
    | Heading
    | ParagraphNode
    | Link
    | Pre
    | Code
    | Image
    | Element
    | Html

  export interface Html extends Unist.Node {
    type: 'html'
    value: string
  }

  export interface Element extends Unist.Parent {
    type: 'element'
    tagName?: string
  }

  export interface CodeElement extends Element {
    tagName: 'code'
    data?: {
      meta?: string
    }
    properties?: {
      className?: string[]
    }
  }

  export interface PreElement extends Element {
    tagName: 'pre'
  }

  export interface Image extends Unist.Node {
    type: 'image'
    title: null
    url: string
    alt?: string
  }

  export interface Blockquote extends Unist.Parent {
    type: 'blockquote'
    children: Flow[]
  }

  export interface Heading extends Unist.Parent {
    type: 'heading'
    depth: number
    children: UnistNode.Phrasing[]
  }

  interface ParagraphNode extends Unist.Parent {
    type: 'paragraph'
    children: Phrasing[]
  }

  export interface Pre extends Unist.Parent {
    type: 'pre'
    children: Phrasing[]
  }

  export interface Code extends Unist.Parent {
    type: 'code'
    value?: string
    lang?: string
    meta?: string | string[]
  }

  export type Phrasing = Text | Emphasis

  export interface Emphasis extends Unist.Parent {
    type: 'emphasis'
    children: Phrasing[]
  }

  export interface Link extends Unist.Parent {
    type: 'link'
    children: Flow[]
    url?: string
  }

  export interface Text extends Unist.Literal {
    type: 'text'
    value: string
  }
}
