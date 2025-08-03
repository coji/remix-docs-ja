import type { ProductId } from '@remix-docs-ja/scripts/services/product'

const SPECIAL_DOMAINS = ['localhost', 'techtalk.jp'] as const
type SpecialDomain = (typeof SPECIAL_DOMAINS)[number]

const isSpecialDomain = (hostname: string): boolean =>
  SPECIAL_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  )

const getBaseDomain = (hostname: string): SpecialDomain | null =>
  SPECIAL_DOMAINS.find(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  ) || null

const handleSpecialDomain = (hostname: string, productId?: string): string => {
  const baseDomain = getBaseDomain(hostname)
  if (!baseDomain) return hostname

  if (productId) {
    return `${productId}.${baseDomain}`
  }
  // If no cityId is provided, always return the base domain
  return baseDomain
}

const handleRegularDomain = (hostname: string, productId?: string): string => {
  const parts = hostname.split('.')

  if (!productId) {
    return parts.length > 2 ? parts.slice(1).join('.') : hostname
  }

  if (parts.length > 2) {
    parts[0] = productId
  } else {
    parts.unshift(productId)
  }
  return parts.join('.')
}

export const getDomain = (url: URL, productId?: ProductId): URL => {
  const newUrl = new URL(url.href)

  newUrl.hostname = isSpecialDomain(newUrl.hostname)
    ? handleSpecialDomain(newUrl.hostname, productId)
    : handleRegularDomain(newUrl.hostname, productId)

  return newUrl
}
