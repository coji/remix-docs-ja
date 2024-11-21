import { ExternalLinkIcon } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Link, type MetaFunction } from 'react-router'
import jobs from '~/assets/jobs.json'
import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  HStack,
  Stack,
} from '~/components/ui'
import type { Route } from './+types'
import { shuffleArray } from './utils'

export const meta: MetaFunction = () => [
  { title: 'Remix のお仕事あります - Remix ドキュメント日本語版' },
]

export const loader = ({ request }: Route.LoaderArgs) => {
  // 表示期間中の求人情報を取得し、シャッフルする
  const filteredJobs = jobs.filter((job) => {
    return (
      new Date(job.openAt) <= new Date() && new Date(job.expiredAt) > new Date()
    )
  })

  // ランダム表示
  return {
    jobs: shuffleArray(filteredJobs),
  }
}

export default function JobBoardIndex({
  loaderData: { jobs },
}: Route.ComponentProps) {
  return (
    <Stack className="gap-2">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Remixドキュメント日本語版</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/job-board">Remixのお仕事あります</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </BreadcrumbList>
      </Breadcrumb>

      {jobs.map((job) => (
        <Card key={job.id}>
          <CardHeader className="not-prose">
            <CardTitle>{job.title}</CardTitle>
            <CardDescription className="break-all">
              <a
                href={job.companyUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 hover:underline"
              >
                {job.company}
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Stack>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
              <ReactMarkdown className="prose max-w-none dark:prose-invert">
                {job.description}
              </ReactMarkdown>
            </Stack>
          </CardContent>
          <CardFooter className="no-prose flex items-center justify-between gap-4">
            <Button asChild variant="link">
              <a href={job.href} target="_blank" rel="noreferrer">
                詳細を見る <ExternalLinkIcon size="16" className="ml-2" />
              </a>
            </Button>
            <HStack className="text-xs text-muted-foreground">
              <div>掲載期間</div>
              <div>2024年7月~2024年12月</div>
            </HStack>
          </CardFooter>
        </Card>
      ))}
    </Stack>
  )
}
