import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import type { RankType } from '../../../../types/car';
import { formatS3BucketURL } from '../../../../util/urlFormatter';
import type { AuthState } from '../../../../types/auth';
import { authFetch } from '../../../../api/authFetch';
import { BACKEND, FRONTEND, PROFILE_PIC } from '../../../../config/env';
import NotFoundComponent from '../../../../components/NotFoundComponent';
import { ShareIcon, PencilIcon, TrashIcon, MinusCircleIcon } from '@heroicons/react/24/outline';
import { useRemoveTune } from '../../../../hooks/useRemoveTune';
import { RemoveDialogModal } from '../../../../components/profile/RemoveDialogModal';
import { useState, useEffect } from 'react';
import {toast} from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faBookmark as faBookmarkSolid } from '@fortawesome/free-solid-svg-icons';
import {faBookmark} from '@fortawesome/free-regular-svg-icons'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import ShareTuneDialogComponent from '../../../../components/tune/ShareTuneDialog';
import TuneDetailsComponent from '../../../../components/tune/TuneDetailsComponent';

export const Route = createFileRoute('/_authenticated/view/tune/$tuneId')({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: 'Tune Details'
      }
    ]
  }),
})

const fetchTuneDetails = async(tune_id: string, auth: AuthState) => {
  const res = await authFetch(`${BACKEND}/tune/${tune_id}`, {method: 'GET', headers: {'Content-Type': 'application/json'}}, auth)
  if(!res.ok){
    const error = new Error('Failed to fetch tunes');
    // Attach the status so we can check it in the component
    (error as any).status = res.status;
    throw error;
  }
  return (await res.json());
}

const classColors: Record<RankType, string> = {
  'S2': 'bg-pink-600',
  'S1': 'bg-purple-600',
  'A': 'bg-blue-600',
  'B': 'bg-orange-600',
  'C': 'bg-yellow-500',
  'D': 'bg-green-600'
};


function RouteComponent() {
  const {auth} = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { tuneId } = Route.useParams();
  
  const { data: tuneDetails, isLoading, error, status } = useQuery({
    queryKey: ['tune', tuneId],
    queryFn: () => fetchTuneDetails(tuneId, auth)
  });

  const [removeModalOpen, setRemoveModalOpen] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState<boolean>(false);

  // Sync isSaved with tuneDetails when data loads/updates
  useEffect(() => {
    if (tuneDetails?.isSaved !== undefined) {
      setIsSaved(tuneDetails.isSaved);
    }
  }, [tuneDetails?.isSaved]);

  const handleRemoveTuneSuccess = async () => {
    toast.success('Tune removed successfully!', {autoClose: 3000});
    if(tuneDetails?.creator === auth.user?.username){
      navigate({to: '/u/$user', params: {user: auth.user!.username}});
    }else{
      setIsSaved(false);
      await queryClient.invalidateQueries({queryKey: ['tune', tuneId]});
      // await queryClient.invalidateQueries({queryKey: ['tunes', auth.user?.username]});
    }
  }

  const handleShareDialogClose = () => {
    setIsShareDialogOpen(false);
  }

  const removeTune = useRemoveTune(auth, async() => handleRemoveTuneSuccess());

  const saveTune = useMutation({
    mutationFn: async() => {
      const res = await authFetch(`${BACKEND}/tune/${tuneDetails?.tune_id}/save`, {method: 'POST'}, auth);
      if(!res.ok){
        throw Error('Error saving tune! Try again later');
      }
    }, 
    onError: (error) => {
      setIsSaved(false);
      toast.error(error?.message || 'Error saving tune! Try again later');
      saveTune.reset();
    },
    onSuccess: async () => {
      toast.success('Tune saved to profile successfully!', {autoClose: 3000});
      saveTune.reset();
      setIsSaved(true);
      await queryClient.invalidateQueries({queryKey: ['tune', tuneId]});
      // await queryClient.invalidateQueries({queryKey: ['tunes', auth.user?.username]});
    }
  })

  const handleSaveTuneClick = () => {
    saveTune.mutate();
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center">
        <svg className="size-8 animate-spin" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/>
          <path fill="currentColor" d="M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z"></path>
        </svg>
      </div>
    );
  }

   if (status === 'error' && (error as any)?.status === 404) {
    return <NotFoundComponent />;
  }

  // Handle no data
  if (!tuneDetails) {
    return null;
  }

  const imageUrl = formatS3BucketURL({manufacturer: tuneDetails.car.Manufacturer!, image_filename: tuneDetails.car.image_filename!, size: "medium"});
  return (
    <div className="min-h-screen w-full flex justify-center px-2 sm:px-4 py-4 md:py-8 bg-slate-50">
      <div className="w-full max-w-6xl">
        
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* LEFT SIDE - Image Only */}
            <div className="w-full md:w-auto shrink-0">
              <img 
                src={imageUrl} 
                alt="Car"
                className="w-64 md:w-72 h-auto object-contain drop-shadow-lg"
              />
            </div>

            {/* RIGHT SIDE - All Info */}
            <div className="flex-1 text-center md:text-left">
              {/* Car Manufacturer */}
              <div className="text-blue-600 text-sm font-bold uppercase tracking-wider mb-1">
                {tuneDetails?.car.Manufacturer}
              </div>
              
              {/* Car Model */}
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {tuneDetails?.car.Model}
              </h1>
              
              {/* Year */}
              <div className="text-slate-500 text-lg font-medium mb-4">
                {tuneDetails?.car.Year}
              </div>

              {/* Tune Name */}
              <div className="bg-slate-50 rounded-lg">
                <div className="text-sm text-slate-600 font-semibold mb-1">Tune Name</div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {tuneDetails?.tune_name}
                </h2>
              </div>
            </div>
          </div>

          {/* METADATA SECTION - Below image, starts from left margin */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
            
            {/* Left side - Created info + Class */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Link to='/u/$user' params={{user: tuneDetails.creator}} className="flex items-center gap-2">
                  <span className="text-slate-600">Created by:</span>
                  <img 
                    src={`${PROFILE_PIC}/${tuneDetails?.profile_pic}`}
                    alt={`${tuneDetails?.creator}'s profile`}
                    className='size-5 sm:size-9 rounded-full object-cover'
                  />
                  <strong className="hover:underline text-slate-900">{tuneDetails?.creator}</strong>
                </Link>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-slate-600">Created on: {new Date(tuneDetails!.created_on!).toLocaleString('en-GB',{day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-semibold">Class:</span>
                <div className={`${classColors[tuneDetails?.class]} w-12 h-12 rounded-full flex items-center justify-center text-white font-black italic shadow-lg border-2 border-white`}>
                  {tuneDetails?.class}
                </div>
              </div>
            </div>

            {/* Right side - Action Buttons */}
            <div className="flex flex-wrap gap-3">
              { isSaved ? (
                <>
                  {tuneDetails?.creator === auth.user?.username && (
                    <Link 
                      to='/tune/edit/$tuneId' 
                      params={{tuneId: tuneDetails!.tune_id.toString()}} 
                      state={{tuneDetails}}
                      className=" bg-blue-600 hover:bg-blue-700 text-white pl-2 pr-3 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                      <PencilIcon className='size-4'/>
                      Edit Tune
                    </Link>
                  )}
                  <RemoveDialogModal 
                    openModal={removeModalOpen}
                    onClose={() => {
                      //reset mutations state before closing the modal
                      removeTune.reset();
                      setRemoveModalOpen(false);
                    }}
                    onSubmit={() => {removeTune.mutate({tune_id: tuneDetails!.tune_id}); setRemoveModalOpen(false)}}
                    mode={tuneDetails?.creator === auth.user?.username ? 'delete' : 'remove'}
                    isLoading={removeTune.isPending}
                  />
                  {tuneDetails?.creator === auth.user?.username ? (
                    <button onClick={() => setRemoveModalOpen(true)} className=" bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2">
                      <TrashIcon className='size-5'/>
                      Delete
                    </button>
                  ) : (
                    <button onClick={() => setRemoveModalOpen(true)} className=" bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2">
                      <MinusCircleIcon className='size-5'/>
                      Remove
                    </button>
                  )}
                  <button onClick={() => setIsShareDialogOpen(true)}className=" bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2">
                    <ShareIcon className='size-5'/>
                    Share
                  </button>
                </>
              ) : (
                  <button  onClick={handleSaveTuneClick} className='border-2 border-black px-2 py-2 rounded-sm hover:bg-black hover:text-white duration-200 '>
                    {saveTune.isPending ? 
                      'Saving ...' : 
                      <><FontAwesomeIcon icon={faBookmark} /> Save to profile</>
                    }
                  </button>
              )}
            </div>
          </div>
        </div>

        {/* Tune Settings Section */}
        <TuneDetailsComponent tuneDetails={tuneDetails} />
      </div>
      <ShareTuneDialogComponent handleDialogClose={handleShareDialogClose} isShareDialogOpen={isShareDialogOpen} url={`${FRONTEND}/share/${tuneDetails!.public_url}`}/>
    </div>
  )
}