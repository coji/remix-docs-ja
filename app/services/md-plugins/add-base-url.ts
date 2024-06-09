import { visit } from 'unist-util-visit'
import type { InternalPlugin, UnistNode } from './types'

// 型定義
interface ImgNode extends Element {
  properties: {
    src: string
  }
}

export const addBaseUrl: InternalPlugin<
  UnistNode.Root,
  UnistNode.Root
> = () => {
  return (tree: UnistNode.Root) => {
    visit(tree, 'element', (node) => {
      const element = node as unknown as ImgNode
      if (
        (element.tagName === 'img' && !!element.properties?.src) ||
        (element.tagName === 'iframe' && !!element.properties?.src)
      ) {
        const src = element.properties.src
        if (!src.startsWith('http://') && !src.startsWith('https://')) {
          element.properties.src = `https://remix.run${src}`
        }
      }
    })
  }
}
