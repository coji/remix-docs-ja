import type { Route } from './+types/index'
import RouteComponent from './route.component'
export default RouteComponent
export { meta } from './route.component'
export { loader } from './route.server'

export const clientLoader = ({ serverLoader }: Route.ClientLoaderArgs) => {
  return serverLoader()
}
