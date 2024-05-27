import { redirect, type LoaderFunctionArgs } from '@remix-run/node'

export const loader = ({ request }: LoaderFunctionArgs) => {
  const search = request.url.search
  return redirect(`https://remix.run/resources?${search}`)
}
