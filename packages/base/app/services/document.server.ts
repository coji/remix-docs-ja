import fs from 'node:fs/promises'
import path from 'node:path'
import type { ProductId } from '~/features/product/products'

export const getDocJson = async (productId: ProductId, file: string) => {
  const filepath = path.join('./public/docs', `${file}.json`)
  try {
    const content = await fs.readFile(filepath, 'utf-8')
    return JSON.parse(content) as {
      attributes: { title: string }
      raw: string
      html: string
      headings: { headingLevel: string; html: string; slug: string }[]
    }
  } catch (e) {
    return null
  }
}
