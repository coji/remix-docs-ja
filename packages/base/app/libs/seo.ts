import { products } from '~/features/product/products'

interface buildPageMetaProps {
  title?: string
  pathname?: string
  productId?: string
}

export const buildPageMeta = ({
  title,
  pathname,
  productId,
}: buildPageMetaProps) => {
  const product =
    products.find((product) => product.id === productId) ?? products[0]
  const ogpImage = `${pathname === '/' ? '/index' : pathname}.png`

  return [
    {
      title: title ? `${title} - ${product.title}` : product.title,
    },
    {
      property: 'og:url',
      content: `${product.url}${pathname}`,
    },
    {
      property: 'og:title',
      content: title ? `${title} - ${product.title}` : product.title,
    },
    {
      property: 'og:image',
      content: pathname
        ? `${product.url}/ogp${ogpImage}`
        : 'https://remix.run/img/og.1.jpg',
    },
    {
      property: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      property: 'twitter:title',
      content: title ? `${title} - ${product.title}` : product.title,
    },
    {
      property: 'twitter:image',
      content: pathname
        ? `${product.url}/ogp${ogpImage}`
        : 'https://remix.run/img/og.1.jpg',
    },
    {
      property: 'og:type',
      content: 'article',
    },
    {
      peroperty: 'og:site_name',
      content: product.title,
    },
    {
      property: 'docsearch:language',
      content: 'ja',
    },
    {
      property: 'docsearch:version',
      content: 'main',
    },
    {
      name: 'robots',
      content: 'index,follow',
    },
    {
      name: 'googlebot',
      content: 'index,follow',
    },
  ]
}
