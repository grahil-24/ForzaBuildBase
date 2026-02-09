import { createFileRoute, Link} from '@tanstack/react-router'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisH, faBookmark } from '@fortawesome/free-solid-svg-icons'
import { PencilIcon, TrashIcon, MinusCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { BACKEND, FRONTEND } from '../../../config/env'
import { useInfiniteQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { authFetch } from '../../../api/authFetch'
import type { AuthState } from '../../../types/auth'
import ErrorToast from '../../../components/ErrorToast'
import { formatS3BucketURL } from '../../../util/urlFormatter'
import type { RankType } from '../../../types/car'
import { useMemo, useState, useCallback} from 'react'
import { useRemoveTune } from '../../../hooks/useRemoveTune'
import { useRenameTune } from '../../../hooks/useRenameTune'
import { RemoveDialogModal } from '../../../components/profile/RemoveDialogModal'
import { RenameDialogModal } from '../../../components/profile/RenameDialogModal'
import {toast} from 'react-toastify'
import type { Tune } from '../../../types/tune'
import { SearchBar } from '../../../components/profile/tunes/SearchBar'
import Fuse from 'fuse.js'
import ScrollToTop from '../../../components/ScrollToTop'
import ShareTuneDialogComponent from '../../../components/tune/ShareTuneDialog'


export const Route = createFileRoute('/_authenticated/u/$user')({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: 'Saved Tunes'
      }
    ]
  }),
  errorComponent: ErrorToast
})


interface InfiniteQueryPageType {
  hasNextPage: boolean, 
  nextCursor: string | undefined,
  pages: Tune[],
  totalCount: number
}

//weights for the different search parameters
const fuseOptions = {
  keys: [
    {
      name: "tune.tune_name",
      weight: 0.5
    },
    {
      name: "tune.car.Manufacturer",
      weight: 0.2
    },
    {
      name: "tune.car.Model",
      weight: 0.1
    },
    {
      name: "tune.creator.username",
      weight: 0.2
    }
  ], 
  threshold: 0.4
}

const shareIcon = 
    <svg className='size-5' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" >
      <path 
        fill="none" 
        stroke="black" 
        stroke-width="32" 
        stroke-linejoin="round" 
        stroke-linecap="round"
        d="M371.8 82.4C359.8 87.4 352 99 352 112L352 192L240 192C142.8 192 64 270.8 64 368C64 481.3 145.5 531.9 164.2 542.1C166.7 543.5 169.5 544 172.3 544C183.2 544 192 535.1 192 524.3C192 516.8 187.7 509.9 182.2 504.8C172.8 496 160 478.4 160 448.1C160 395.1 203 352.1 256 352.1L352 352.1L352 432.1C352 445 359.8 456.7 371.8 461.7C383.8 466.7 397.5 463.9 406.7 454.8L566.7 294.8C579.2 282.3 579.2 262 566.7 249.5L406.7 89.5C397.5 80.3 383.8 77.6 371.8 82.6z"/>
    </svg>
 

const fetchTunes = async({user, pageParam, auth}: {user: string, pageParam: string | undefined, auth: AuthState}): Promise<InfiniteQueryPageType> => {
  const url = pageParam 
    ? `${BACKEND}/profile/${user}/tunes?cursor=${pageParam}` 
    : `${BACKEND}/profile/${user}/tunes`;
  const res = await authFetch(url, {method: 'GET'}, auth);
  return await res.json();
}

const rank_to_color: Record<RankType, string> = {
  S2: "bg-blue-800",
  S1: "bg-purple-500",
  A: "bg-rose-600",
  B: "bg-orange-500",
  C: "bg-amber-300",
  D: "bg-cyan-300"
}

type SortOption = 'newest' | 'oldest' | 'alphabetical'

function RouteComponent() {
  const {auth} = Route.useRouteContext();
  const queryClient = useQueryClient();
  const {user} = Route.useParams();

  const [renameModalOpen, setRenameModalOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [removeModalOpen, setRemoveModalOpen] = useState<boolean>(false);
  const [selectedTuneId, setSelectedTuneId] = useState<number | null>(null);
  //if the creator of tune is the current user, he is allowed to delete the tune or else just remove it
  const [removeMode, setRemoveMode] = useState<'delete' | 'remove'>('delete');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [shareDialogTuneId, setShareDialogTuneId] = useState<number | null>(null);

  const {data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status} = useInfiniteQuery({
    queryKey: ['tunes', user],
    queryFn: ({pageParam}) => fetchTunes({user, auth, pageParam}),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const handleOpenRemoveModal = (tuneId: number) => {
      setSelectedTuneId(tuneId);
      setRemoveMode('remove');
      setRemoveModalOpen(true);
  }

  const handleOpenDeleteModal = (tuneId: number) => {
      setSelectedTuneId(tuneId);
      setRemoveMode('delete');
      setRemoveModalOpen(true);
  }

  const handleRemoveTuneSuccess = async() => {
    toast.success('Tune removed successfully!');
    //when data has been deleted, need to refresh data
    await queryClient.invalidateQueries({queryKey: ['tunes', user]});
  }

  const handleCloseRenameModal = () => {
      setRenameModalOpen(false);
      setSelectedTuneId(null);
  };

  const handleRenameTuneSuccess = async() => {
      toast.success('Tune renamed successfully!');
      handleCloseRenameModal();
      //when data has been modified, need to refresh data
      await queryClient.invalidateQueries({queryKey: ['tunes', user]});
  }

  const handleOpenRenameModal = (tuneId: number) => {
      setSelectedTuneId(tuneId);
      setRenameModalOpen(true);
  };

  const handleShareDialogClose = () => {
    setShareDialogTuneId(null);
  }


  const removeTune = useRemoveTune(auth, handleRemoveTuneSuccess);
  const renameTune = useRenameTune(auth);

  const saveTune = useMutation({
    mutationFn: async(tune_id: number) => {
      const res = await authFetch(`${BACKEND}/tune/${tune_id}/save`, {method: 'POST'}, auth);
      if(!res.ok){
        throw Error('Error saving tune! Try again later');
      }
    }, 
    onError: (error) => {
      toast.error(error?.message || 'Error saving tune! Try again later');
      saveTune.reset();
    },
    onSuccess: async() => {
      toast.success('Tune saved to profile successfully!', {autoClose: 3000});
      saveTune.reset();
      await queryClient.invalidateQueries({queryKey: ['tunes', user]});
    }
  })

  const handleSaveTune = (tune_id: number) => {
    saveTune.mutate(tune_id);
  }

  const getSortLabel = (option: SortOption) => {
    switch(option) {
      case 'newest': return 'Newest';
      case 'oldest': return 'Oldest';
      case 'alphabetical': return 'Alphabetical';
    }
  };

  const sortTunes = useCallback((tunes: Tune[]) => {
    switch(sortBy){
      case 'newest': 
        return tunes.sort((a, b) => new Date(b.saved_on).getTime() - new Date(a.saved_on).getTime());
      case 'oldest': 
        return tunes.sort((a, b) => new Date(a.saved_on).getTime() - new Date(b.saved_on).getTime());
      case 'alphabetical':
        return tunes.sort((a, b) => `${a.tune.car.Manufacturer}${a.tune.car.Model}`.localeCompare(`${b.tune.car.Manufacturer}${b.tune.car.Model}`))
    }
  }, [sortBy])

  const processedTunes = useMemo(() => {
    console.log("data ", data);
    if (!data?.pages) return [];
    
    let allTunes = data.pages.flatMap((page) => page.pages);
    
    // Apply search filter
    if (search.trim()) {
      const fuse = new Fuse(allTunes, fuseOptions);
      allTunes = fuse.search(search).map((result) => result.item);
    }
    
    // Apply sorting
    return sortTunes(allTunes);
  }, [data, search, sortTunes]);

  return (
    <div>
      <div className='top-0 bg-white border-b border-gray-200 shadow-sm'>
        <div className='max-w-4xl mx-auto px-4 py-6'>
          <div className='flex items-center justify-between flex-wrap gap-4'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Saved Tunes</h1>
              <p className='text-sm text-gray-600 mt-1'>
                {data?.pages[0]?.totalCount || 0} {(data?.pages[0]?.totalCount || 0) === 1 ? 'tune' : 'tunes'} in your collection
              </p>
            </div>
    
            <div className='flex items-center gap-4'>
              <SearchBar onChange={(input: string) => {setSearch(input)}}/>
              <Menu as="div" className="relative inline-block text-left">
                <MenuButton className="group inline-flex text-sm font-medium text-gray-700 hover:text-gray-900">
                  Sort: {getSortLabel(sortBy)}
                  <ChevronDownIcon 
                    className="-mr-1 ml-1 h-5 w-5 shrink-0 text-gray-400 group-hover:text-gray-500" 
                    aria-hidden="true"
                  />
                </MenuButton>
              
                <MenuItems
                  transition
                  anchor="bottom end"
                  className="absolute right-0 z-1 mt-2 w-30 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black/5 focus:outline-none transition flex justify-center duration-100 ease-out data-closed:scale-95 data-closed:opacity-0"
                >
                  <div className="py-1">
                    <MenuItem>
                      {({ focus }) => (
                        <button
                          onClick={() => setSortBy('newest')}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            focus ? 'bg-gray-100' : ''
                          } ${sortBy === 'newest' ? 'font-medium text-gray-900' : 'text-gray-500'}`}
                        >
                          Newest
                        </button>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <button
                          onClick={() => setSortBy('oldest')}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            focus ? 'bg-gray-100' : ''
                          } ${sortBy === 'oldest' ? 'font-medium text-gray-900' : 'text-gray-500'}`}
                        >
                          Oldest
                        </button>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <button
                          onClick={() => setSortBy('alphabetical')}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            focus ? 'bg-gray-100' : ''
                          } ${sortBy === 'alphabetical' ? 'font-medium text-gray-900' : 'text-gray-500'}`}
                        >
                          Alphabetical
                        </button>
                      )}
                    </MenuItem>
                  </div>
                </MenuItems>
              </Menu>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className='max-w-4xl mx-auto px-4 py-6 space-y-3'>
        {status === 'pending' ? (
          <div className='flex justify-center'>
            <svg className="size-5 animate-spin" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/>
              <path fill="currentColor" d="M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z"></path>
            </svg>  
          </div>
        )  : (
          <>
          {status === 'error' && (
          // <div className='flex justify-center text-red-600'>
          //   Error loading tunes
          // </div>
            
            (<ErrorToast error={error} />)
          )
          }
            <RenameDialogModal 
              openModal={renameModalOpen}
              onClose={handleCloseRenameModal}
              onSubmit={(newName) => {renameTune.mutate({newName, tune_id: selectedTuneId!},
                {
                  onSuccess: async () => {
                    await handleRenameTuneSuccess();
                    renameTune.reset();
                  }
                }
              );}}
              isLoading={renameTune.isPending}
              isSuccess={renameTune.isSuccess}
            />
            <RemoveDialogModal 
              openModal={removeModalOpen}
              onClose={() => {
                removeTune.reset();
                setRemoveModalOpen(false);
              }}
              onSubmit={() => {removeTune.mutate({tune_id: selectedTuneId!}); setRemoveModalOpen(false)}}
              mode={removeMode}
              isLoading={removeTune.isPending}
            />

            {processedTunes.length === 0 && search.trim() ? (
              <div className='flex flex-col items-center justify-center py-12 text-gray-500'>
                <p className='text-lg'>No tunes found matching "{search}"</p>
                <p className='text-sm mt-2'>Try adjusting your search terms</p>
              </div>
            ) : processedTunes.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-gray-500'>
                <p className='text-lg'>No saved tunes yet</p>
                <p className='text-sm mt-2'>Start browsing to save your first tune!</p>
              </div>
            ) : (
              processedTunes.map((tune, index) => {
                const image_url = formatS3BucketURL({manufacturer: tune.tune.car.Manufacturer, image_filename: tune.tune.car.image_filename});
                return (
                  <div key={index} className='relative flex items-center border border-gray-200 bg-white hover:shadow-lg transition-shadow duration-200 overflow-hidden rounded-lg'>
                    {/* Clickable Link Overlay */}
                    <Link 
                      className='absolute inset-0 z-0' 
                      to='/view/tune/$tuneId' 
                      params={{tuneId: tune.tune.tune_id.toString()}}
                    />
                    
                    {/* Content Container - Above Link */}
                    <div className='relative z-1 flex items-center w-full pointer-events-none'>
                      {/* Rank Badge */}
                      <div className='hidden sm:flex items-center justify-center w-16 md:w-20 text-black'>
                        <span className='text-2xl md:text-3xl font-bold opacity-50'>#{index+1}</span>
                      </div>
                      
                      {/* Car Image */}
                      <div className='w-32 sm:w-40 md:w-48 lg:w-56 shrink-0 flex items-center justify-center from-gray-50 to-gray-100'>
                        <img 
                          className='w-full h-auto object-contain' 
                          src={image_url}
                          alt={`${tune.tune.car.Manufacturer} ${tune.tune.car.Model}`}
                        />
                      </div>
                      
                      {/* Content */}
                      <div className='flex-1 px-4 py-2 md:px-6 flex flex-col justify-center min-w-0'>
                        <h2 className='overflow-hidden text-xs sm:text-sm md:text-xl font-bold text-gray-900 mb-1 truncate'>
                          {tune.tune.car.Manufacturer} {tune.tune.car.Model}
                        </h2>
                        
                        <p className='text-xs sm:text-sm md:text-base text-gray-600 mb-2 sm:mb-3 truncate'>
                          {tune.tune.tune_name}
                        </p>
                        
                        <div className='flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm text-gray-600'>
                          <Link className='pointer-events-auto' to='/u/$user'params={{user: tune.tune.creator.username}}><span>Creator: <span className='hover:underline font-semibold text-gray-800'>{tune.tune.creator.username}</span></span></Link>
                          <span className='hidden sm:inline text-gray-400'>•</span>
                          <span>Created: {new Date(tune.saved_on).toLocaleString('en-GB',{day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                      
                      {/* Class Badge - Top Right */}
                      <div className='absolute top-2 right-2 sm:top-3 sm:right-16 md:right-20'>
                        <span className={`inline-block px-2 py-0.5 sm:px-3 sm:py-1 ${rank_to_color[tune.tune.resultant_rank as RankType]} text-white text-[10px] sm:text-xs md:text-sm font-bold shadow-md rounded`}>
                          CLASS {tune.tune.resultant_rank}
                        </span>
                      </div>
                      
                      {/* Menu  */}
                      <div className='relative z-2 flex items-center pr-3 md:pr-4 pointer-events-auto'>
                        <Menu as="div" className="relative">
                          <MenuButton className="p-1 cursor-pointer focus:outline-none mt-2 sm:mt-0 rounded-2xl">
                            <FontAwesomeIcon 
                              icon={faEllipsisH} 
                              className="text-gray-600 text-lg md:text-xl" 
                            />
                          </MenuButton>
                          <MenuItems
                            transition
                            modal={false}
                            anchor="bottom start"
                            className="absolute right-0 mt-0 w-30 sm:w-35 bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden z-3 focus:outline-none transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0"
                          >
                            {auth.user?.username === tune.tune.creator.username && 
                              <MenuItem>
                                <button 
                                  onClick={() => handleOpenRenameModal(tune.tune.tune_id)} 
                                  className='cursor-pointer group flex w-full items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors hover:bg-blue-100/50'
                                >
                                  <PencilIcon className="size-4 sm:size-5 text-gray-600 transition-colors group-hover:text-blue-600" />
                                  <span className='text-gray-700 transition-colors group-hover:text-blue-600'>Rename</span>
                                </button>
                              </MenuItem>
                            }
                            {auth.user?.username === tune.tune.creator.username ? (
                              <MenuItem>
                                <button 
                                  onClick={() => handleOpenDeleteModal(tune.tune.tune_id)} 
                                  className='cursor-pointer group flex w-full items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors hover:bg-red-100/50'
                                >
                                  <TrashIcon className="transition-colors size-4 sm:size-5 text-gray-600 group-hover:text-red-600" />
                                  <span className='transition-colors text-gray-700 group-hover:text-red-600'>Delete</span>
                                </button>
                              </MenuItem>
                            ) : tune.isSaved ? (
                              <MenuItem>
                                <button 
                                  onClick={() => handleOpenRemoveModal(tune.tune.tune_id)} 
                                  className='cursor-pointer group flex w-full items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors hover:bg-red-100/50'
                                >
                                  <MinusCircleIcon className="transition-colors size-4 sm:size-5 text-gray-600 group-hover:text-red-600" />
                                  <span className='transition-colors text-gray-700 group-hover:text-red-600'>Remove</span>
                                </button>
                              </MenuItem>
                            ) : (
                              <MenuItem>
                                <button 
                                  onClick={() => handleSaveTune(tune.tune.tune_id)} 
                                  className='cursor-pointer group flex w-full items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors hover:bg-green-100/50'
                                >
                                  <FontAwesomeIcon icon={faBookmark} />
                                  <span className='transition-colors text-gray-700 group-hover:text-green-600'>Save</span>
                                </button>
                              </MenuItem>
                            )}
                            <MenuItem>
                              <button 
                                onClick={() => setShareDialogTuneId(tune.tune.tune_id)} 
                                className='cursor-pointer group flex w-full items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors hover:bg-gray-200/50'
                              >
                                {shareIcon}
                                <span className='transition-colors text-gray-700'>Share</span>
                              </button>
                            </MenuItem>
                          </MenuItems>
                        </Menu>
                      </div>
                    </div>
                    <ShareTuneDialogComponent url={`${FRONTEND}/share/${tune.tune.public_url}`} handleDialogClose={handleShareDialogClose} isShareDialogOpen={shareDialogTuneId === tune.tune.tune_id}/>
                  </div>
                );
              })
            )}
            
            <div className='flex justify-center'>
              <button
                className={`${hasNextPage ? 'border cursor-pointer hover:bg-gray-50' : 'border-0'} border-gray-300 rounded-lg px-6 py-3 mt-5 font-medium text-gray-700 transition-colors`}
                onClick={async() => await fetchNextPage()}
                disabled={!hasNextPage || isFetching}
              >
                {isFetchingNextPage
                  ? 'Loading more...'
                  : hasNextPage
                    ? 'Load More'
                    : 'You have reached the end!'}
              </button>
            </div>
            <div className='text-center text-gray-500 text-sm'>{isFetching && !isFetchingNextPage ? 'Fetching...' : null}</div>
          </>
        )}
      </div>
      <ScrollToTop visiblePosition={30}/>
    </div>
  )
}