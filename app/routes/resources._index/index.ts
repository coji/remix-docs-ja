import { redirect } from 'react-router'
import type * as Route from './+types.index'

export const loader = ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url)
  return redirect(`https://remix.run/resources?${url.searchParams.toString()}`)
}
