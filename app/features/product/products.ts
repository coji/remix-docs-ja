export const products = [
  {
    id: 'remix-docs-ja',
    name: 'Remix',
    title: 'Remixドキュメント日本語版',
    pagefind: '/pagefind/remix-docs-ja/pagefind.js?url',
  },
  {
    id: 'react-router-docs-ja',
    name: 'React Router',
    title: 'React Routerドキュメント日本語版',
    pagefind: '/pagefind/react-router-docs-ja/pagefind.js?url',
  },
] satisfies Product[]

export type ProductId = 'remix-docs-ja' | 'react-router-docs-ja'
export type Product = {
  id: ProductId
  name: string
  title: string
  pagefind: string
}

export const isProductId = (productId: string): productId is ProductId =>
  products.map((prd) => prd.id as string).includes(productId)
