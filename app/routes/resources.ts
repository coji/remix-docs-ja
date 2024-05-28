import { redirect, type LoaderFunctionArgs } from '@remix-run/node'

export const loader = ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  return redirect(`https://remix.run/resources?${url.searchParams.toString()}`)
}
