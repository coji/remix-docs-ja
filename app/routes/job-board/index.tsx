import { unstable_defineLoader as defineLoader } from '@remix-run/node'
import { Link, useFetcher, useLocation } from '@remix-run/react'
import { useEffect } from 'react'
import { Badge, HStack, Skeleton, Stack } from '~/components/ui'
import { cn } from '~/libs/utils'

const jobs = [
  {
    company: '株式会社ABCDEFGHIJKLMNOPQRSTU',
    title: 'Remix デベロッパー',
    tags: ['フルリモート', '業務委託OK', '週3日以下OK', 'B2B'],
    openAt: '2024-07-01 15:00',
    expiredAt: '2024-09-01 15:00',
    href: 'https://www.techtalk.jp/',
  },
  {
    company: '株式会社ふがふが',
    title: 'プロダクトエンジニア',
    tags: ['B2C', 'リモート'],
    openAt: '2024-07-01 15:00',
    expiredAt: '2024-08-01 15:00',
    href: 'https://www.techtalk.jp/',
  },
  {
    company: '株式会社TechTalk',
    title: 'Remix デベロッパー',
    tags: ['フルリモート', '業務委託', '週3日以下OK', 'B2B'],
    openAt: '2024-07-09 15:00',
    expiredAt: '2024-07-01 15:00',
    href: 'https://www.techtalk.jp/',
  },
]

export const loader = defineLoader(() => {
  // ランダムに１件の求人情報を返す
  const openJobs = jobs.filter((job) => {
    return (
      new Date(job.openAt) <= new Date() && new Date(job.expiredAt) > new Date()
    )
  })
  const job = openJobs[Math.floor(Math.random() * openJobs.length)]
  return { job, count: openJobs.length }
})

interface JobBoardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const JobBoard = ({ className }: JobBoardProps) => {
  const fetcher = useFetcher<typeof loader>()
  const { pathname } = useLocation()

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    fetcher.load('/job-board')
  }, [pathname])

  const job = fetcher?.data?.job
  const count = fetcher?.data?.count

  return (
    <div
      className={cn('rounded-md border-2 border-primary md:block', className)}
    >
      <div className="rounded-md px-2 py-1 text-sm hover:bg-secondary">
        {job ? (
          <Stack className="gap-1" asChild>
            <a href={job.href} target="_blank" rel="noreferrer">
              <HStack className="flex-wrap gap-0">
                <div className="font-bold">{job.title}</div>
                <div className="flex-1" />
                <div className="break-all text-xs text-primary/50">
                  {job.company}
                </div>
              </HStack>
              <HStack className="flex-wrap gap-1">
                {job.tags.map((tag) => {
                  return <Badge key={tag}>{tag}</Badge>
                })}
              </HStack>
            </a>
          </Stack>
        ) : (
          <Stack className="gap-1">
            <Skeleton className="h-5 w-full rounded-full" />
            <Skeleton className="h-5 w-full rounded-full" />
            <Skeleton className="h-4 w-full rounded-full" />
          </Stack>
        )}
      </div>
      <div className="bg-primary px-2 pt-0.5 text-xs">
        <HStack asChild className="text-primary-foreground hover:underline">
          <Link to="/job-board/">
            <div className="flex-1 whitespace-nowrap">
              Remix のお仕事あります
            </div>
            <div className="whitespace-nowrap">{count} Jobs</div>
          </Link>
        </HStack>
      </div>
    </div>
  )
}
