import { redirect } from 'react-router'
import type { Route } from './+types'

export const loader = ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url)
  return redirect(`https://remix.run/resources?${url.searchParams.toString()}`)
}
