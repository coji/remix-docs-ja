import type * as Unified from 'unified'
import type * as Unist from 'unist'

export interface ProcessorOptions {
  productId?: string
  resolveHref?(href: string): string
}

export type InternalPlugin<
  Input extends string | Unist.Node | undefined,
  Output,
> = Unified.Plugin<[ProcessorOptions?], Input, Output>

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
