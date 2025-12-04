import { createFileRoute } from '@tanstack/react-router'
import Nav from '../components/Navbar'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div><Nav/></div>
}
