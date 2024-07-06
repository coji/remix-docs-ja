import { unstable_defineLoader as defineLoader } from '@remix-run/node'

const jobs = [
  {
    company: '株式会社ほげほげ',
    title: 'Remix デベロッパー',
    product: 'Super Duper Product',
  },
]

export const loader = defineLoader(() => {
  // ランダムに１件の求人情報を返す
  const job = jobs[Math.floor(Math.random() * jobs.length)]
  return { job }
})
