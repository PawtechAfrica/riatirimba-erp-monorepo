import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(app)/__layout/administration/__admin_layout/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/__layout/administration/__admin_layout/"!</div>
}
