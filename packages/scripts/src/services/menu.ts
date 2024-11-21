import type { ProductId } from '@remix-docs-ja/base/features/product/products'
import type { MenuDoc } from '@remix-docs-ja/base/services/menu.server'
import fg from 'fast-glob'
import parseYamlHeader from 'gray-matter'
import fs from 'node:fs/promises'
import path from 'node:path'

const makeSlug = (filepath: string, productId: ProductId) => {
  const regexp = new RegExp(`^(.+\/)?docs/${productId}/`)
  return filepath
    .replace(regexp, '')
    .replace(/\.md$/, '')
    .replace(/\/index$/, '')
    .replace(/\/$/, '')
}

const parseAttrs = (
  filepath: string,
  md: string,
): {
  content: string
  attrs: { title: string } & Record<string, unknown>
} => {
  const filename = path.basename(filepath, '.md')
  const { data, content } = parseYamlHeader(md)
  return {
    content,
    attrs: {
      title: filename,
      ...data,
    },
  }
}

const buildMenu = async (productId: ProductId) => {
  const docs: MenuDoc[] = []
  const files = await fg(`docs/${productId}/**/*.md`, { onlyFiles: true })
  for (const filepath of files) {
    const content = await fs.readFile(filepath, 'utf-8')
    const { attrs, content: md } = parseAttrs(filepath, content)
    const slug = makeSlug(filepath, productId)

    // don't need docs/index.md in the menu
    if (slug === '') continue

    // can have docs not in the menu
    if (attrs.hidden) continue

    docs.push({
      attrs,
      filename: filepath,
      slug,
      hasContent: md.length > 0,
      children: [],
    })
  }
  // sort so we can process parents before children
  docs.sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0))

  // construct the hierarchy
  const tree: MenuDoc[] = []
  const map = new Map<string, MenuDoc>()
  for (const doc of docs) {
    const { slug } = doc

    const parentSlug = slug.substring(0, slug.lastIndexOf('/'))
    map.set(slug, doc)

    if (parentSlug) {
      const parent = map.get(parentSlug)
      if (parent) {
        doc.parentSlug = parent.slug
        parent.children.push(doc)
      }
    } else {
      tree.push(doc)
    }
  }

  const sortDocs = (a: MenuDoc, b: MenuDoc) =>
    (a.attrs.order || Number.POSITIVE_INFINITY) -
    (b.attrs.order || Number.POSITIVE_INFINITY)

  // sort the parents and children
  tree.sort(sortDocs)
  for (const category of tree) {
    category.children.sort(sortDocs)
  }
  return tree
}

export const buildMenus = async (productId: ProductId) => {
  const menus = await buildMenu(productId)
  const filename = `public/menus/${productId}/menu.json`
  const dir = path.dirname(filename)
  console.log(filename)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(filename, JSON.stringify(menus, null, 2))
}
