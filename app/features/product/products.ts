export const products = {
  'remix-docs-ja': {
    id: 'remix-docs-ja',
    name: 'Remix',
    title: 'Remixドキュメント日本語版',
  },
  'react-router-docs-ja': {
    id: 'react-router-docs-ja',
    name: 'React Router',
    title: 'React Routerドキュメント日本語版',
  },
} satisfies Record<string, Product>

export type ProductId = keyof typeof products
export type Product = { id: string; name: string; title: string }

export const isProductId = (productId: string): productId is ProductId =>
  productId in products
