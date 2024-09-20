import { isProductId, products } from './products'

export const getProduct = (request: Request) => {
  // リクエストURLのドメイン名から、都市を判定する
  // 例: https://tokyo.example.com -> cityId = 'tokyo'
  // 例: https://seoul.example.com -> cityId = 'seoul'
  const url = new URL(request.url)
  const host = url.host.split('.')[0]
  const productId = isProductId(host) ? host : 'remix-docs-ja'
  const product = products[productId]
  return { productId, product }
}
