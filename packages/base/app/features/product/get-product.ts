import { products } from './products'

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

export const getProductById = (id: string) => {
  return products.find((prd) => prd.id === id)
}
