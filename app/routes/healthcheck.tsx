import type { Route } from './+types/healthcheck'

export const loader = ({ request }: Route.LoaderArgs) => {
  return new Response('OK')
}
