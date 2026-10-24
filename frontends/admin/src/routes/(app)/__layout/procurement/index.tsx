import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/__layout/procurement/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/__layout/procurement/"!</div>
}
