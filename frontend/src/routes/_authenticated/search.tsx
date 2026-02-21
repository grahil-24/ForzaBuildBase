import { createFileRoute } from '@tanstack/react-router'
import type { AuthState } from '../../types/auth'

type SearchQuery = {
  q: string, 
  type?: 'user' | 'tune'
}

export const Route = createFileRoute('/_authenticated/search')({
  validateSearch: (search: Record<string, unknown>): SearchQuery => {
    return {
      q: typeof search.q === 'string' ? search.q : '',
      type: search.type === 'user' || search.type === 'tune' ? search.type : undefined,
    }
  },
  loaderDeps: ({ search }) => ({
    q: search.q,
    type: search.type,
  }),
  loader: ({context, deps}) => {
    if(!deps.type){
      fetchUsersAndTunes(deps.q, context.auth);
    }
  },
  component: RouteComponent,
})

const fetchUsersAndTunes = (query: string, auth: AuthState) => {

}

function RouteComponent() {
  return (
    <></>
  )
}
