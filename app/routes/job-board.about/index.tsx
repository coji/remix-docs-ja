import { Link } from 'react-router'
import AboutDoc from '~/assets/job-board.about.mdx'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Stack,
} from '~/components/ui'
import { cn } from '~/libs/utils'

export default function job() {
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
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/job-board/about">このサイトについて</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle>このサイトについて</CardTitle>
          <CardDescription>Remixのお仕事あります、とは。</CardDescription>
        </CardHeader>
        <CardContent className={cn('prose dark:prose-invert', 'max-w-none')}>
          <AboutDoc />
        </CardContent>
      </Card>
    </Stack>
  )
}
