import { createFileRoute } from '@tanstack/react-router'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons'
import { PencilIcon, TrashIcon, MinusCircleIcon } from '@heroicons/react/24/outline'
import { BACKEND } from '../../../config/env'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { authFetch } from '../../../api/authFetch'
import type { AuthState } from '../../../types/auth'
import ErrorToast from '../../../components/ErrorToast'
import { formatS3BucketURL } from '../../../util/urlFormatter'
import type { RankType } from '../../../types/car'
import { useState } from 'react'
import { useRemoveTune } from '../../../hooks/useRemoveTune'
import { useRenameTune } from '../../../hooks/useRenameTune'
import { RemoveDialogModal } from '../../../components/profile/RemoveDialogModal'
import { RenameDialogModal } from '../../../components/profile/RenameDialogModal'
import {toast} from 'react-toastify'

export const Route = createFileRoute('/_authenticated/profile/tunes')({
  component: RouteComponent,
  errorComponent: ErrorToast
})

const fetchTunes = async({pageParam, auth}: {pageParam: number, auth: AuthState}) => {
  const url = pageParam 
    ? `${BACKEND}/profile/my-tunes?cursor=${pageParam}` 
    : `${BACKEND}/profile/my-tunes`;
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

function RouteComponent() {
  const {auth} = Route.useRouteContext();
  const queryClient = useQueryClient();

  const [renameModalOpen, setRenameModalOpen] = useState<boolean>(false);
  const [removeModalOpen, setRemoveModalOpen] = useState<boolean>(false);
  const [selectedTuneId, setSelectedTuneId] = useState<number | null>(null);
  const [removeMode, setRemoveMode] = useState<'delete' | 'remove'>('delete');
  const {data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status} = useInfiniteQuery({
    queryKey: ['tunes'],
    queryFn: ({pageParam}) => fetchTunes({auth,pageParam}),
    initialPageParam: 0,
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
    await queryClient.invalidateQueries({queryKey: ['tunes']});
  }

  const handleCloseRenameModal = () => {
      setRenameModalOpen(false);
      setSelectedTuneId(null);
  };

  const handleRenameTuneSuccess = async() => {
      toast.success('Tune renamed successfully!');
      handleCloseRenameModal();
      await queryClient.invalidateQueries({queryKey: ['tunes']});
  }

  const handleOpenRenameModal = (tuneId: number) => {
      setSelectedTuneId(tuneId);
      setRenameModalOpen(true);
  };

  const removeTune = useRemoveTune(auth, handleRemoveTuneSuccess);
  const renameTune = useRenameTune(auth);
  
  return (
  <div className='flex-col max-w-4xl mx-auto px-4 py-6 space-y-3'>
    {status === 'pending' ? (
      <div className='flex justify-center'>
        <svg className="size-5 animate-spin" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/><path fill="currentColor" d="M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z"></path>
        </svg>  
      </div>
    ) : (
      <>
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
        {data!.pages.flatMap((page) => page.pages).map((tune, index) => {
          const image_url = formatS3BucketURL({manufacturer: tune.tune.car.Manufacturer, image_filename: tune.tune.car.image_filename});
          return (
            <div key={index} className='cursor-pointer relative flex items-center border border-gray-200 bg-white hover:shadow-lg transition-shadow duration-200 overflow-hidden'>
              {/* Rank Badge */}
              <div className='hidden sm:flex items-center justify-center w-16 md:w-20 text-black'>
                <span className='text-2xl md:text-3xl font-bold opacity-50'>#{index+1}</span>
              </div>
              
              {/* Car Image */}
              <div className='w-32 sm:w-40 md:w-48 lg:w-56 shrink-0 flex items-center justify-center from-gray-50 to-gray-100'>
                <img 
                  className='w-full h-auto object-contain' 
                  src={image_url}
                  alt="Abarth 124 Spider"
                />
              </div>
              
              {/* Content */}
              <div className='flex-1 px-4 py-2 md:px-6 flex flex-col justify-center min-w-0'>
                <h2 className='overflow-hidden text-sm sm:text-sm md:text-xl font-bold text-gray-900 mb-1 truncate'>
                  {tune.tune.car.Manufacturer} {tune.tune.car.Model}
                </h2>
                
                <p className='text-sm md:text-base text-gray-600 mb-3'>
                  {tune.tune.tune_name}
                </p>
                
                <div className='flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm text-gray-600'>
                  <span>Creator: <span className='font-semibold text-gray-800'>{tune.tune.creator.username}</span></span>
                  <span className='hidden sm:inline text-gray-400'>•</span>
                  <span>Created: {tune.saved_on}</span>
                </div>
              </div>
              
              {/* Class Badge - Top Right */}
              <div className='absolute top-3 right-3 sm:right-16 md:right-20'>
                <span className={`inline-block px-3 py-1 ${rank_to_color[tune.tune.resultant_rank as RankType]} text-white text-xs md:text-sm font-bold shadow-md`}>
                  CLASS {tune.tune.resultant_rank}
                </span>
              </div>
              
              {/* Menu */}
              <div className='flex items-center pr-3 md:pr-4'>
                <Menu as="div" className="relative">
                  <MenuButton className="p-2 hover:bg-gray-100 transition-colors duration-150">
                    <FontAwesomeIcon 
                      icon={faEllipsisH} 
                      className="text-gray-600 text-lg md:text-xl" 
                    />
                  </MenuButton>
                  <MenuItems
                    transition
                    modal={false}
                    anchor="bottom end"
                    className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl overflow-hidden z-50 focus:outline-none transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0"
                  >
                    <MenuItem>
                      <button onClick={() => handleOpenRenameModal(tune.tune.tune_id)} className='cursor-pointer group flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-blue-100/50'>
                        <PencilIcon className="size-5 text-gray-600 transition-colors group-hover:text-blue-600" />
                        <span className='text-gray-700 transition-colors group-hover:text-blue-600'>Rename</span>
                      </button>
                    </MenuItem>
                    {auth.user?.username === tune.tune.creator.username ?
                      (
                        <MenuItem>
                            <button onClick={() => handleOpenDeleteModal(tune.tune.tune_id)}className='cursor-pointer group flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-red-100/50'>
                              <TrashIcon className="transition-colors size-5 text-gray-600 group-hover:text-red-600" />
                              <span className='transition-colors text-gray-700 group-hover:text-red-600'>Delete</span>
                            </button>
                        </MenuItem>
                      ) : (
                        <MenuItem>
                          <button onClick={() => handleOpenRemoveModal(tune.tune.tune_id)} className='cursor-pointer group flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-red-100/50'>
                            <MinusCircleIcon className="transition-colors size-5 text-gray-600 group-hover:text-red-600" />
                            <span className='transition-colors text-gray-700 group-hover:text-red-600'>Remove</span>
                          </button>
                        </MenuItem>
                      )
                    }
                  </MenuItems>
                </Menu>
              </div>
            </div>
          );
        })}
        
        <div className='flex justify-center'>
          <button
            className={`${hasNextPage ? 'border cursor-pointer' : 'border-0'} border-black border p-2 mt-5`}
            onClick={async() => await fetchNextPage()}
            disabled={!hasNextPage || isFetching}
          >
            {isFetchingNextPage
              ? 'Loading more...'
              : hasNextPage
                ? 'Load More'
                : 'Nothing more to load'}
          </button>
        </div>
        
        <div>{isFetching && !isFetchingNextPage ? 'Fetching...' : null}</div>
      </>
    )}
  </div>
)
}