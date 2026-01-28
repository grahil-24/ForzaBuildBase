import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/view/tune/$tuneId')({
  loader: async({context, params, location}) => {
    const tuneData = location.state.tuneDetails;
    return tuneData;
  },
  head: () => ({
    meta: [
      {
        title: 'Tune Details'
      }
    ]
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/view/tune/$tuneId"!</div>
}
