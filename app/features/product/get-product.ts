import { products } from './products'

export const getProduct = (request: Request) => {
  // リクエストURLのドメイン名から、都市を判定する
  // 例: https://remix-docs-ja.example.com -> product = 'remix-docs-ja'
  // 例: https://react-router-docs-ja.example.com -> product = 'react-router-docs-ja'
  const origin =
    request.headers.get('X-Forwarded-Host') ?? request.headers.get('host')
  const host = origin?.split('.')[0]
  const product = products.find((prd) => prd.id === host) ?? products[0]
  return { product }
}
