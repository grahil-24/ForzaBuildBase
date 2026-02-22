import { useInfiniteQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'
import type { AuthState } from '../../types/auth';
import { authFetch } from '../../api/authFetch';
import { BACKEND, PROFILE_PIC } from '../../config/env';

type SearchQuery = {
  q: string, 
  type?: 'user' | 'tune'
}

type Users = {
  username: string;
  profile_pic: string;
}[];

type UserQueryResult = {
  items: Users,
  totalCount: number,
  hasPrevPage: boolean,
  hasNextPage: boolean,
  nextCursor: string | undefined,
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
  // loader: ({context, deps}) => {
  //   if(!deps.type){
  //     fetchUsersAndTunes(deps.q, context.auth);
  //   }
  // },
  component: RouteComponent,
})

const fetchUsers = async(query: string, auth: AuthState, pageParam: string | undefined): Promise<UserQueryResult> => {
  const url = pageParam ? `${BACKEND}/search/user?user=${query}&cursor=${pageParam}` : `${BACKEND}/search/user?user=${query}`
  const res = await authFetch(`${url}`, {method: 'GET'}, auth);
  const data: UserQueryResult = await res.json();
  return data;
}

function RouteComponent() {
  const {auth} = Route.useRouteContext();
  const searchQuery = Route.useSearch();

  const userQuery = useInfiniteQuery({
    queryKey: ['users', searchQuery.q],
    queryFn: async({pageParam}) => await fetchUsers(searchQuery.q, auth, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  return (
    <div className='w-3/4 mx-auto'>
      <h2>Results for "{searchQuery.q}"</h2>
      <div>
        {userQuery.data?.pages.flatMap((page) => page.items).map((user) => (
          <div
            key={user.username}
            style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0" }}
          >
            <img
              src={`${PROFILE_PIC}/${user.profile_pic}`}
              alt={user.username}
              style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }}
            />
            <span>{user.username}</span>
          </div>
        ))}
    </div>
    </div>
  )
}
