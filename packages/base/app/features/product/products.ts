export const products = [
  {
    id: 'remix',
    name: 'Remix',
    title: 'Remixドキュメント日本語版',
    url: 'https://remix-docs-ja.techtalk.jp',
    englishUrl: 'https://remix.run/docs',
    pagefind: '/pagefind/pagefind.js?url',
  },
  {
    id: 'react-router-v7',
    name: 'React Router',
    title: 'React Router v7 ドキュメント日本語版',
    url: 'https://react-router-docs-ja.techtalk.jp',
    englishUrl: 'https://reactrouter.com',
    pagefind: '/pagefind/pagefind.js?url',
  },
] satisfies Product[]

export type ProductId = 'remix' | 'react-router-v7'
export type Product = {
  id: ProductId
  name: string
  title: string
  url: string
  englishUrl: string
  pagefind: string
}

export const isProductId = (productId: string): productId is ProductId =>
  products.map((prd) => prd.id as string).includes(productId)
