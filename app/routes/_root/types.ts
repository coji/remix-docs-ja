interface MenuDocAttributes {
  title: string
  order?: number
  new?: boolean
  [key: string]: unknown
}

export interface MenuDoc {
  attrs: MenuDocAttributes
  parentSlug?: string
  children: MenuDoc[]
  filename: string
  hasContent: boolean
  slug: string
}
