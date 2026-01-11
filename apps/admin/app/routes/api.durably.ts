import { durablyHandler } from '~/services/durably.server'
import type { Route } from './+types/api.durably'

export async function loader({ request }: Route.LoaderArgs) {
  return await durablyHandler.handle(request, '/api/durably')
}

export async function action({ request }: Route.ActionArgs) {
  return await durablyHandler.handle(request, '/api/durably')
}
