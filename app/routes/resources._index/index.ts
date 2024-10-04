import { redirect, type LoaderFunctionArgs } from 'react-router'

export const loader = ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  return redirect(`https://remix.run/resources?${url.searchParams.toString()}`)
}
