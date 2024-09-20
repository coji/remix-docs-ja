import fs from 'node:fs/promises'
import type { ProductId } from '~/features/product/products'

export interface MenuDocAttributes {
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

export const getMenu = async (productId: ProductId) => {
  const menu = await fs.readFile(`public/menus/${productId}/menu.json`, 'utf-8')
  return JSON.parse(menu) as MenuDoc[]
}

export const getCurrentMenuItem = (menu: MenuDoc[], filename: string) => {
  return menu
    .flatMap((category) => category.children)
    .find((menuItem) => menuItem.filename === filename)
}
