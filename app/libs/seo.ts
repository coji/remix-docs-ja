export const buildPageMeta = (title?: string, slug?: string) => {
  return [
    {
      title: title
        ? `${title} - Remix ドキュメント日本語版`
        : 'Remix ドキュメント日本語版',
    },
    {
      property: 'og:url',
      content: `https://remix-docs-ja.techtalk.jp/${slug}`,
    },
    {
      property: 'og:title',
      content: title
        ? `${title} - Remix ドキュメント日本語版`
        : 'Remix ドキュメント日本語版',
    },
    {
      property: 'og:image',
      content: 'https://remix.run/img/og.1.jpg',
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
      content: 'https://remix.run/img/og.1.jpg',
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
