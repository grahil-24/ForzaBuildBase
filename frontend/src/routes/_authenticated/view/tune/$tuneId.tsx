import { createFileRoute, Link, notFound, useNavigate } from '@tanstack/react-router'
import { formatS3BucketURL } from '../../../../util/urlFormatter';
import type { AuthState } from '../../../../types/auth';
import { authFetch } from '../../../../api/authFetch';
import { BACKEND } from '../../../../config/env';
import NotFoundComponent from '../../../../components/NotFoundComponent';
import { ShareIcon, PencilIcon, TrashIcon, MinusCircleIcon } from '@heroicons/react/24/outline';
import { useRemoveTune } from '../../../../hooks/useRemoveTune';
import { RemoveDialogModal } from '../../../../components/profile/RemoveDialogModal';
import { useState } from 'react';
import {toast} from 'react-toastify';

export const Route = createFileRoute('/_authenticated/view/tune/$tuneId')({
  loader: async({context, params, location}) => {
    let tuneData = location.state.tuneDetails;
    if(tuneData === undefined){
      tuneData = await fetchTuneDetails(params.tuneId, context.auth);  
    }
    return tuneData;
  },
  head: () => ({
    meta: [
      {
        title: 'Tune Details'
      }
    ]
  }),
  
  notFoundComponent: NotFoundComponent,
  component: RouteComponent,
})

const fetchTuneDetails = async(tune_id: string, auth: AuthState) => {
  const res = await authFetch(`${BACKEND}/tune/${tune_id}`, {method: 'GET', headers: {'Content-Type': 'application/json'}}, auth)
  if(res.status === 404){
    throw notFound();
  }
  if(!res.ok){
    throw new Error();
  }
  return (await res.json());
}

function RouteComponent() {
  const tuneDetails = Route.useLoaderData();
  const {auth} = Route.useRouteContext();
  const navigate = useNavigate();
  const [removeModalOpen, setRemoveModalOpen] = useState<boolean>(false);
  
  const handleRemoveTuneSuccess = () => {
    toast.success('Tune removed successfully!', {autoClose: 3000});
    navigate({to: '/profile/tunes'});
  }

  const removeTune = useRemoveTune(auth, async() => handleRemoveTuneSuccess());
  const imageUrl = formatS3BucketURL({manufacturer: tuneDetails!.car.Manufacturer!, image_filename: tuneDetails!.car.image_filename!, size: "medium"});
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
                className="w-64 md:w-72 md:-mt-8 h-auto object-contain drop-shadow-lg"
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 border-t border-slate-100">
            
            {/* Left side - Created info + Class */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-600">Created by: <strong className="text-slate-900">{tuneDetails?.creator}</strong></span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-slate-600">Created on: {new Date(tuneDetails!.created_on!).toLocaleString()}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-semibold">Class:</span>
                <div className="bg-purple-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-black italic shadow-lg border-2 border-white">
                  {tuneDetails?.class}
                </div>
              </div>
            </div>

            {/* Right side - Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {tuneDetails?.creator === auth.user?.username && 
                <Link to='/tune/edit/$tuneId' params={{tuneId: tuneDetails!.tune_id.toString()}} state={{tuneDetails}}>
                  <button className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white pl-2 pr-3 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2">
                    <PencilIcon className='size-4 mr-auto'/>
                    Edit Tune
                  </button>
                </Link>
              }
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
                  <button onClick={() => setRemoveModalOpen(true)} className="cursor-pointer bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2">
                    <TrashIcon className='size-5'/>
                    Delete
                  </button>
                ) : (
                  <button onClick={() => setRemoveModalOpen(true)} className="cursor-pointer bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2">
                    <MinusCircleIcon className='size-5'/>
                    Remove
                  </button>
                )
              }
              <button className="cursor-pointer bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2">
                <ShareIcon className='size-5'/>
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Tune Settings Section */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Tune Settings</h3>
          
          {/* Settings Grid - FIXED: Maintains 2 columns on smaller screens, reduced internal spacing */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 items-start">
            
            {/* Tires Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 md:p-5">
              <div className="flex items-center mb-4">
                <h4 className="md:text-lg font-bold text-slate-900">Tires</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Front Pressure</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.front_tire_pressure} psi</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Rear Pressure</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.rear_tire_pressure} psi</span>
                </div>
              </div>
            </div>

            {/* Anti-Roll Bars Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 md:p-5">
              <div className="flex items-center mb-4">
                <h4 className="md:text-lg font-bold text-slate-900">Anti-Roll Bars</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Front ARB</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.front_arb}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Rear ARB</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.rear_arb}</span>
                </div>
              </div>
            </div>

            {/* Aero Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 md:p-5">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="md:text-lg font-bold text-slate-900">Aero</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Front Downforce</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.front_aero} lb</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Rear Downforce</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.rear_aero} lb</span>
                </div>
              </div>
            </div>

            {/* Springs Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 md:p-5">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="md:text-lg font-bold text-slate-900">Springs</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Front Spring</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.front_spring} lb/in</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Rear Spring</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.rear_spring} lb/in</span>
                </div>
              </div>
            </div>

            {/* Ride Height Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 md:p-5">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="md:text-lg font-bold text-slate-900">Ride Height</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Front</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.front_ride_height} in</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Rear</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.rear_ride_height} in</span>
                </div>
              </div>
            </div>
            
            {/* Brakes Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 md:p-5">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="md:text-lg font-bold text-slate-900">Brakes</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Balance</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.brake_balance}%</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Pressure</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.brake_pressure}%</span>
                </div>
              </div>
            </div>

             {/* Damping Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 md:p-5">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="md:text-lg font-bold text-slate-900">Damping</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Front Rebound</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.front_rebound}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Rear Rebound</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.rear_rebound}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Front Bump</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.front_bump}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Rear Bump</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.rear_bump}</span>
                </div>
              </div>
            </div>

            {/* Differential Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 md:p-5">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="md:text-lg font-bold text-slate-900">Differential</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Front Accel</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.front_diff_accel}%</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Front Decel</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.front_diff_decel}%</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Rear Accel</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.rear_diff_accel}%</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Rear Decel</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.rear_diff_decel}%</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Center Balance</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.center_diff_balance}%</span>
                </div>
              </div>
            </div>

             {/* Alignment Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 md:p-5">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="md:text-lg font-bold text-slate-900">Alignment</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Front Camber</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.front_camber}°</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Rear Camber</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.rear_camber}°</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Front Toe</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.front_toe}°</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Rear Toe</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.rear_toe}°</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Caster</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.front_caster}°</span>
                </div>
              </div>
            </div>

             {/* Gearing Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 md:p-5">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="md:text-lg font-bold text-slate-900">Gearing</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 font-medium text-sm">Final Drive</span>
                  <span className="text-slate-900 font-bold text-sm md:text-base">{tuneDetails?.tune_details.final_drive}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}