import { remember } from '@epic-web/remember'
import fs from 'node:fs/promises'

export const getFontData = async () => {
  return await remember('fontData', async () => {
    const data = await fs.readFile('./app/assets/fonts/NotoSansJP-Bold.ttf')
    const fontData = data.buffer.slice(
      data.byteOffset,
      data.byteOffset + data.byteLength,
    )
    return fontData
  })
}
