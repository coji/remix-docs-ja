import crypto from 'node:crypto'

// md5sum を計算する
export const md5sum = (content: string) => {
  const hash = crypto.createHash('md5')
  return hash.update(content).digest('hex')
}
