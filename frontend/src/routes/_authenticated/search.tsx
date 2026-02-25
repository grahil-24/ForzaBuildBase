import { useInfiniteQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import type { AuthState } from '../../types/auth';
import { authFetch } from '../../api/authFetch';
import { BACKEND, PROFILE_PIC } from '../../config/env';
import { ArrowLongRightIcon, ArrowLongLeftIcon, CalendarIcon } from '@heroicons/react/24/outline';
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

type Tune = {
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

const rank_to_color: Record<RankType, string> = {
  S2: "bg-blue-800",
  S1: "bg-purple-500",
  A: "bg-rose-600",
  B: "bg-orange-500",
  C: "bg-amber-300",
  D: "bg-cyan-300"
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
  <div className="flex justify-center w-full py-8">
    <button
      className={`px-8 py-2.5 rounded-full font-semibold transition-all duration-200 
        ${query.hasNextPage 
          ? 'bg-gray-800 text-white hover:bg-black shadow-md hover:shadow-lg active:scale-95' 
          : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
      onClick={() => query.fetchNextPage()}
      disabled={!query.hasNextPage || query.isFetching}
    >
      {query.isFetchingNextPage
        ? 'Loading more...'
        : query.hasNextPage
          ? 'Load More Results'
          : 'End of Results'}
    </button>
  </div>
);

function RouteComponent() {
  const { auth } = Route.useRouteContext();
  const searchQuery = Route.useSearch();
  const navigate = useNavigate({ from: '/search' });
  const type = searchQuery.type;

  const userQuery = useInfiniteQuery({
    queryKey: ['users', searchQuery.q],
    queryFn: ({ pageParam }) => fetchUsers(searchQuery.q, auth, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const tuneQuery = useInfiniteQuery({
    queryKey: ['tunes', searchQuery.q],
    queryFn: ({ pageParam }) => fetchTunes(searchQuery.q, auth, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const goToAll = (t: 'user' | 'tune') => navigate({ search: (prev) => ({ ...prev, type: t }) });
  const goBack = () => navigate({ search: (prev) => ({ ...prev, type: undefined }) });

  return (
    <div className='max-w-5xl mx-auto px-4 py-8'>
      {/* Header Section */}
      <div className="mb-8">
        {!type ? (
          <h1 className='text-2xl font-bold text-gray-900'>Results for "{searchQuery.q}"</h1>
        ) : (
          <button 
            onClick={goBack}
            className='flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors group'
          >
            <ArrowLongLeftIcon className="size-5 mr-2 group-hover:-translate-x-1 transition-transform"/>
            Back to all results
          </button>
        )}
      </div>

      {/* Users Section */}
      {type !== 'tune' && (
        <section className='mb-6 sm:mb-12'>
          <div className="flex items-baseline justify-between border-b border-gray-100 pb-2 mb-4">
            <h2 className='font-bold text-xl text-gray-800'>Users</h2>
            {!type && userQuery.data?.pages[0]?.hasNextPage && (
              <button onClick={() => goToAll('user')} className="group text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center">
                See all {userQuery.data.pages[0].totalCount} <ArrowLongRightIcon className="size-4 ml-1 group-hover:translate-x-1 transition-transform"/>
              </button>
            )}
          </div>
          
          {/* Empty State */}
          {userQuery.isSuccess && userQuery.data.pages[0]?.items?.length === 0 ? (
            <div className="py-5 text-center border-2 border-dashed border-gray-100 rounded-xl">
              <p className="text-gray-400 font-medium">No users found matching "{searchQuery.q}"</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {(type === 'user'
                ? userQuery.data?.pages.flatMap((page) => page.items)
                : userQuery.data?.pages[0]?.items
              )?.map((user) => (
                <Link 
                  key={user.username} 
                  to='/u/$user' 
                  params={{ user: user.username }}
                  className='flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all'
                >
                  <img
                    src={`${PROFILE_PIC}/${user.profile_pic}`}
                    alt={user.username}
                    className='w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm'
                  />
                  <span className="font-semibold text-gray-700 text-lg">{user.username}</span>
                </Link>
              ))}
            </div>
          )}
          {type === 'user' && <LoadMoreButton query={userQuery} />}
        </section>
      )}

    {/* ── Tunes Section ── */}
    {type !== 'user' && (
      <section>
        <div className="flex items-baseline justify-between border-b border-gray-100 pb-2 mb-3">
          <h2 className='font-bold text-lg text-gray-800'>Tunes</h2>
          {!type && tuneQuery.data?.pages[0]?.hasNextPage && (
            <button onClick={() => goToAll('tune')} className="group text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center">
              See all {tuneQuery.data.pages[0].totalCount} <ArrowLongRightIcon className="size-4 ml-1 group-hover:translate-x-1 transition-transform"/>
            </button>
          )}
        </div>

        {/* Empty State */}
      {tuneQuery.isSuccess && tuneQuery.data.pages[0]?.items?.length === 0 ? (
          <div className="py-5 text-center border-2 border-dashed border-gray-100 rounded-xl">
            <p className="text-gray-400 font-medium">No tunes found matching "{searchQuery.q}"</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {(type === 'tune'
              ? tuneQuery.data?.pages.flatMap((page) => page.items)
              : tuneQuery.data?.pages[0]?.items
            )?.map((tune) => {
              const car_image_url = formatS3BucketURL({
                manufacturer: tune.car.Manufacturer, 
                image_filename: tune.car.image_filename, 
                size: 'small'
              });
              
              return (
                <div
                  key={tune.tune_id}
                  className='flex items-center gap-3 px-2 sm:p-2 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-gray-50/50 transition-all group'
                >
                  <div className="w-1/4 sm:w-32 aspect-video overflow-hidden rounded-md  shrink-0 border border-gray-50">
                    <img
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                      src={car_image_url}
                      alt={`${tune.car.Manufacturer} ${tune.car.Model}`}
                    />
                    {/* <div className="absolute top-1 left-1 text-sm text-black px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      {tune.resultant_rank}
                    </div> */}
                  </div>

                  <div className='flex flex-col grow min-w-0'>
                    <Link to='/view/tune/$tuneId' params={{ tuneId: String(tune.tune_id) }}>
                      <h3 className='font-bold text-sm sm:text-base text-gray-900 hover:text-blue-600 transition-colors truncate leading-tight'>
                        {tune.tune_name}
                      </h3>
                    </Link>
                    <p className='text-[11px] sm:text-xs text-gray-500 font-medium truncate'>
                      {tune.car.Manufacturer} {tune.car.Model}
                    </p>

                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
                      <Link 
                        to='/u/$user' 
                        params={{ user: tune.creator.username }}
                        className="flex items-center gap-1.5 hover:text-blue-500 font-medium truncate group/user"
                      >
                        <img
                          src={`${PROFILE_PIC}/${tune.creator.profile_pic}`}
                          alt={tune.creator.username}
                          className='w-4 h-4 rounded-full object-cover border border-gray-200'
                        />
                        <span className="truncate max-w-20 sm:max-w-[120px]">{tune.creator.username}</span>
                      </Link>
                      <span className="flex items-center gap-1 shrink-0 border-l border-gray-200 pl-3">
                        <CalendarIcon className="size-3" />
                        {new Date(tune.created_on).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className='mb-auto'>
                    <span className={`inline-block px-2 py-0.5 sm:px-3 sm:py-1 ${rank_to_color[tune.resultant_rank as RankType]} text-white text-[10px] sm:text-xs font-bold shadow-md rounded`}>
                      {tune.resultant_rank}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {type === 'tune' && <LoadMoreButton query={tuneQuery} />}
      </section>
    )}
    </div>
  );
}