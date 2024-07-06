import { useFetcher, useLocation } from '@remix-run/react'
import { useEffect } from 'react'
import { cn } from '~/libs/utils'
import type { loader } from './route'

interface JobBoardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const JobBoard = ({ className }: JobBoardProps) => {
  const fetcher = useFetcher<typeof loader>()
  const { pathname } = useLocation()

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    fetcher.load('/job-board')
  }, [pathname])

  return (
    <div
      className={cn(
        'rounded-md border-4 border-indigo-500 md:block',
        className,
      )}
    >
      <div className="rounded-md px-2 py-1 text-sm">
        {fetcher.data ? (
          <>
            <div>{fetcher.data?.job.product}</div>
            <div>{fetcher.data?.job.title}</div>
            <div className="text-xs text-slate-500">
              {fetcher.data?.job.company}
            </div>
          </>
        ) : (
          'Loading...'
        )}
      </div>
      <div className="bg-indigo-500 px-2 pt-0.5 text-right text-xs italic text-white">
        Remix Job Board
      </div>
    </div>
  )
}
