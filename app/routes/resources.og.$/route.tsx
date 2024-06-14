import type { LoaderFunctionArgs } from '@remix-run/node'
import { ImageResponse } from '@vercel/og'
import { getDoc } from '~/services/document.server'
import { getFontData } from './functions/get-font-data.server'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const schema = url.protocol === 'http:' ? 'http' : 'https'
  const origin = request.headers.get('host') ?? url.origin
  const filename = params['*'] ?? 'index'
  const doc =
    filename === 'index'
      ? { attributes: { title: 'Remixドキュメント日本語版' } }
      : await getDoc(filename)
  if (!doc) {
    return new Response('Not Found', { status: 404 })
  }

  const fontData = await getFontData()
  const response = new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#212121',
          padding: '4rem',
          boxShadow: 'none',
          color: 'white',
          border: '10px',
          borderRadius: '30px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'baseline',
            flexGrow: '1',
          }}
        >
          <div
            style={{
              fontSize: '80px',
              flexDirection: 'column',
              justifyContent: 'center',
              wordBreak: 'break-word',
              flexGrow: '1',
            }}
          >
            {doc.attributes.title}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            fontSize: '32px',
          }}
        >
          <div>Remix ドキュメント日本語版</div>
          <div style={{ flexGrow: '1' }} />
          {/* biome-ignore lint/a11y/useAltText: <explanation> */}
          <img
            width="202"
            height="60"
            src={`${schema}://${origin}/remix-white.png`}
          />
        </div>
      </div>
    ),
    {
      fonts: [
        {
          name: 'NotoSansJP',
          data: fontData,
          style: 'normal',
        },
      ],
    },
  )
  return response
}
