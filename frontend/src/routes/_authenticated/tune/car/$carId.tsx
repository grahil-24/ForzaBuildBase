import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/tune/car/$carId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/tune/car/$carId"!</div>
}
