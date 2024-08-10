import { SKIP, visit } from 'unist-util-visit'
import type { InternalPlugin, UnistNode } from './types'

export const stripLinkExtPlugin: InternalPlugin<
  UnistNode.Root,
  UnistNode.Root
> = (options = {}) => {
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

function isRelativeUrl(test: string) {
  // Probably fragile but should work well enough.
  // It would be nice if the consumer could provide a baseURI we could do
  // something like:
  // new URL(baseURI).origin === new URL(test, baseURI).origin
  const regexp = /^(?:[a-z]+:)?\/\//i
  return !regexp.test(test)
}
