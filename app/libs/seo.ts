interface buildPageMetaProps {
  title?: string
  pathname?: string
}

export const buildPageMeta = ({ title, pathname }: buildPageMetaProps) => {
  return [
    {
      title: title
        ? `${title} - Remix ドキュメント日本語版`
        : 'Remix ドキュメント日本語版',
    },
    {
      property: 'og:url',
      content: `https://remix-docs-ja.techtalk.jp${pathname}`,
    },
    {
      property: 'og:title',
      content: title
        ? `${title} - Remix ドキュメント日本語版`
        : 'Remix ドキュメント日本語版',
    },
    {
      property: 'og:image',
      content: pathname
        ? `https://remix-docs-ja.techtalk.jp/resources/og${pathname}`
        : 'https://remix.run/img/og.1.jpg',
    },
    {
      property: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      property: 'twitter:title',
      content: title
        ? `${title} - Remix ドキュメント日本語版`
        : 'Remix ドキュメント日本語版',
    },
    {
      property: 'twitter:image',
      content: pathname
        ? `https://remix-docs-ja.techtalk.jp/resources/og${pathname}`
        : 'https://remix.run/img/og.1.jpg',
    },
    {
      property: 'og:type',
      content: 'article',
    },
    {
      peroperty: 'og:site_name',
      content: 'Remix ドキュメント日本語版',
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
