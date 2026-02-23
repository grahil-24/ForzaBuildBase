import { useInfiniteQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import type { AuthState } from '../../types/auth';
import { authFetch } from '../../api/authFetch';
import { BACKEND, PROFILE_PIC } from '../../config/env';
import { ArrowLongRightIcon, ArrowLongLeftIcon } from '@heroicons/react/24/outline';
import type { RankType } from '../../types/car';
import { formatS3BucketURL } from '../../util/urlFormatter';
import type { UseInfiniteQueryResult, InfiniteData } from '@tanstack/react-query';

type SearchQuery = {
  q: string, 
  type?: 'user' | 'tune'
}

type User = {
  username: string; 
  profile_pic: string;
}

type UserQueryResult = {
  items: User[],
  totalCount: number,
  hasPrevPage: boolean,
  hasNextPage: boolean,
  nextCursor: string | undefined,
}

type Tune = {          // fixed: was accidentally typed as an array itself
  tune_id: number,
  tune_name: string,
  creator: User,
  car: {
    Manufacturer: string,
    Model: string,
    image_filename: string
  },
  created_on: string,
  resultant_rank: RankType
}

type TuneQueryResult = {
  items: Tune[],
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
  component: RouteComponent,
})

const fetchUsers = async (query: string, auth: AuthState, pageParam: string | undefined): Promise<UserQueryResult> => {
  const url = pageParam ? `${BACKEND}/search/users?user=${query}&cursor=${pageParam}` : `${BACKEND}/search/users?user=${query}`
  const res = await authFetch(url, { method: 'GET' }, auth);
  return res.json();
}

const fetchTunes = async (query: string, auth: AuthState, pageParam: string | undefined): Promise<TuneQueryResult> => {
  const url = pageParam ? `${BACKEND}/search/tunes?tune=${query}&cursor=${pageParam}` : `${BACKEND}/search/tunes?tune=${query}`
  const res = await authFetch(url, { method: 'GET' }, auth);
  return res.json();
}

type LoadMoreProps = {
  query: UseInfiniteQueryResult<InfiniteData<UserQueryResult | TuneQueryResult, unknown>, Error>
}

const LoadMoreButton = ({ query }: LoadMoreProps) => (
  <button
    className={`${query.hasNextPage ? 'border hover:bg-gray-50' : 'border-0'} border-gray-300 rounded-lg px-6 py-3 mt-5 font-medium text-gray-700 transition-colors`}
    onClick={() => query.fetchNextPage()}
    disabled={!query.hasNextPage || query.isFetching}
  >
    {query.isFetchingNextPage
      ? 'Loading more...'
      : query.hasNextPage
        ? 'Load More'
        : 'You have reached the end!'}
  </button>
);


function RouteComponent() {
  const { auth } = Route.useRouteContext();
  const searchQuery = Route.useSearch();
  const navigate = useNavigate({ from: '/search' });

  const type = searchQuery.type;

  const userQuery = useInfiniteQuery({
    queryKey: ['users', searchQuery.q],
    queryFn: async ({ pageParam }) => await fetchUsers(searchQuery.q, auth, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const tuneQuery = useInfiniteQuery({
    queryKey: ['tunes', searchQuery.q],
    queryFn: async ({ pageParam }) => await fetchTunes(searchQuery.q, auth, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const goToAll = (t: 'user' | 'tune') => {
    navigate({ search: (prev) => ({ ...prev, type: t }) });
  };

  const goBack = () => {
    navigate({ search: (prev) => ({ ...prev, type: undefined }) });
  };

  return (
    <div className='w-3/4 mx-auto'>
      {!type ? (
        <h2>Results for "{searchQuery.q}"</h2>
      ) : (
        <p className='cursor-pointer hover:underline' onClick={goBack}>
          <ArrowLongLeftIcon className="size-5 inline align-middle mr-1"/>
          <span>Back to all results for "{searchQuery.q}"</span>
        </p>
      )}

      {/* ── Users ── */}
      {type !== 'tune' && (
        <div className='mt-5'>
          <h2 className='font-bold text-2xl'>Users</h2>
          <div className='mt-3'>
            <div
              style={{
                display: type === 'user' ? "grid" : "flex",
                flexDirection: type === 'user' ? undefined : "column",
                gridTemplateColumns: type === 'user' ? "repeat(2, 1fr)" : undefined,
              }}
            >
              {(type === 'user'
                ? userQuery.data?.pages.flatMap((page) => page.items)
                : userQuery.data?.pages[0]?.items
              )?.map((user) => (
                <div
                  key={user.username}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0" }}
                >
                  <img
                    src={`${PROFILE_PIC}/${user.profile_pic}`}
                    alt={user.username}
                    style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }}
                  />
                  <Link to='/u/$user' params={{ user: user.username }}>
                    <span>{user.username}</span>
                  </Link>
                </div>
              ))}
            </div>

            {userQuery.data?.pages[0]?.hasNextPage && !type && (
              <p className='cursor-pointer hover:underline mt-2' onClick={() => goToAll('user')}>
                <span>Show all {userQuery.data.pages[0].totalCount} users</span>
                <ArrowLongRightIcon className="size-5 inline align-middle ml-1"/>
              </p>
            )}

            {type === 'user' && <LoadMoreButton query={userQuery} />}
          </div>
        </div>
      )}

      {/* ── Tunes ── */}
      {type !== 'user' && (
        <div className='mt-8'>
          <h2 className='font-bold text-2xl'>Tunes</h2>
          <div className='mt-3'>
            <div
              style={{
                display: type === 'tune' ? "grid" : "flex",
                flexDirection: type === 'tune' ? undefined : "column",
                gridTemplateColumns: type === 'tune' ? "repeat(2, 1fr)" : undefined,
                gap: "8px",
              }}
            >
              {(type === 'tune'
                ? tuneQuery.data?.pages.flatMap((page) => page.items)
                : tuneQuery.data?.pages[0]?.items
              )?.map((tune) => {
                const car_image_url = formatS3BucketURL({manufacturer: tune.car.Manufacturer, image_filename: tune.car.image_filename, size: 'small'});
                return (
                <div
                  key={tune.tune_id}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0" }}
                >
                  <img
                    src={`${car_image_url}`}
                    alt={`${tune.car.Manufacturer} ${tune.car.Model}`}
                    style={{ width: "64px", height: "48px", borderRadius: "6px", objectFit: "cover" }}
                  />
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <Link to='/view/tune/$tuneId' params={{ tuneId: String(tune.tune_id) }}>
                      <span className='font-medium hover:underline'>{tune.tune_name}</span>
                    </Link>
                    <span className='text-sm text-gray-500'>
                      {tune.car.Manufacturer} {tune.car.Model} · {tune.resultant_rank}
                    </span>
                    <Link to='/u/$user' params={{ user: tune.creator.username }}>
                      <span className='text-sm text-gray-400 hover:underline'>by {tune.creator.username}</span>
                    </Link>
                  </div>
                </div>
              )})}
            </div>

            {tuneQuery.data?.pages[0]?.hasNextPage && !type && (
              <p className='cursor-pointer hover:underline mt-2' onClick={() => goToAll('tune')}>
                <span>Show all {tuneQuery.data.pages[0].totalCount} tunes</span>
                <ArrowLongRightIcon className="size-5 inline align-middle ml-1"/>
              </p>
            )}

            {type === 'tune' && <LoadMoreButton query={tuneQuery} />}
          </div>
        </div>
      )}
    </div>
  );
}