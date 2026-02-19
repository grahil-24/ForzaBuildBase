import { createFileRoute, notFound, useNavigate } from '@tanstack/react-router'
import TuneDetailsComponent from '../../components/tune/TuneDetailsComponent';
import NotFoundComponent from '../../components/NotFoundComponent';
import { useEffect } from 'react';
import { BACKEND, PROFILE_PIC } from '../../config/env';
import type { RankType } from '../../types/car';
import { formatS3BucketURL } from '../../util/urlFormatter';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/share/$public_url')({
    beforeLoad: ({params}) => {
        if(params.public_url.length !== 22){
            throw notFound();
        }
    },
    loader: async ({params}) => {
      const res = await fetch(`${BACKEND}/tune/public/${params.public_url}`);
      if(!res.ok){
          throw notFound();
      }
      return await res.json();
    },
    notFoundComponent: NotFoundComponent,
    component: RouteComponent,
})

const classColors: Record<RankType, string> = {
  'S2': 'bg-pink-600',
  'S1': 'bg-purple-600',
  'A': 'bg-blue-600',
  'B': 'bg-orange-600',
  'C': 'bg-yellow-500',
  'D': 'bg-green-600'
};

function RouteComponent() {
  const navigate = useNavigate();
  const { auth } = Route.useRouteContext();
  const tuneDetails = Route.useLoaderData();

  useEffect(() => {
    // If user is authenticated, redirect to the authenticated tune view
    if(auth.user){
        navigate({
            to: '/view/tune/$tuneId',
            params: { tuneId: tuneDetails.tune_id.toString() }
        });
    }
  }, [auth.user, navigate, tuneDetails.tune_id]);

  // Show nothing while redirecting authenticated users
  if(auth.user){
    return null;
  }

  const imageUrl = formatS3BucketURL({manufacturer: tuneDetails.car.Manufacturer!, image_filename: tuneDetails.car.image_filename!, size: "medium"});

  return (
    <div className="min-h-screen w-full flex justify-center px-19 sm:px-21 py-21 md:py-25 bg-slate-50">
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
            
            {/* Left side - Created info + Class */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Link to='/u/$user' params={{user: tuneDetails.creator}} className="flex items-center gap-2">
                  <span className="text-slate-600">Created by:</span>
                  <img 
                    src={`${PROFILE_PIC}/${tuneDetails.profile_pic}`}
                    alt={`${tuneDetails.creator}'s profile`}
                    className='size-5 sm:size-9 rounded-full object-cover'
                  />
                  <strong className="hover:underline text-slate-900">{tuneDetails.creator}</strong>
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
            <Link 
              to='/login' 
              search={{redirect: `/view/tune/${tuneDetails.tune_id}`}}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors inline-block"
            >
              Login to Save
            </Link>
          </div>
        </div>

        <TuneDetailsComponent tuneDetails={tuneDetails}/>
      </div>
    </div>
  )
}