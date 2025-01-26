export const products = [
  {
    id: 'remix',
    name: 'Remix',
    title: 'Remix ドキュメント 日本語版',
    url: 'https://remix-docs-ja.techtalk.jp',
    englishUrl: 'https://remix.run/docs',
  },
  {
    id: 'react-router-v7',
    name: 'React Router',
    title: 'React Router v7 ドキュメント 日本語版',
    url: 'https://react-router-docs-ja.techtalk.jp',
    englishUrl: 'https://reactrouter.com',
  },
] satisfies Product[]

export type ProductId = 'remix' | 'react-router-v7'
export type Product = {
  id: ProductId
  name: string
  title: string
  url: string
  englishUrl: string
}

export const isProductId = (productId: string): productId is ProductId =>
  products.map((prd) => prd.id as string).includes(productId)

export const getProductById = (id: string) => {
  return products.find((prd) => prd.id === id)
}

export const getProduct = (request: Request) => {
  // リクエストURLのドメイン名から、製品を判定する
  // 例: https://remix-docs-ja.example.com -> product = 'remix-docs-ja'
  // 例: https://react-router-docs-ja.example.com -> product = 'react-router-docs-ja'
  const host =
    request.headers.get('X-Forwarded-Host') ??
    request.headers.get('host') ??
    new URL(request.url).host
  const subdomain = host?.split('.')[0]
  const product = products.find((prd) => prd.id === subdomain) ?? products[0]
  return { product }
}
