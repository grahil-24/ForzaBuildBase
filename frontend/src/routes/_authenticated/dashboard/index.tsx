import { createFileRoute, Link } from '@tanstack/react-router'
import type { AuthState } from '../../../types/auth';
import { authFetch } from '../../../api/authFetch';
import { BACKEND } from '../../../config/env';
import type { Tune } from '../../../types/tune';
import { Carousel } from '../../../components/profile/Carousel/CarouselIndex';
import ErrorToast from '../../../components/ErrorToast';

export const Route = createFileRoute('/_authenticated/dashboard/')({
    loader: async({context}) => await fetchProfile(context.auth),
    preload: true,
    component: RouteComponent,
    staleTime: 10_000, // Data is fresh for 10 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    errorComponent: ErrorToast,
    head: () => ({
        meta: [
            {
                title: 'Profile'
            }
        ]
    }),
})

const fetchProfile = async (auth: AuthState) => {
    const res = await authFetch(`${BACKEND}/me/tunes/recent`,
        {method: 'GET'},
        auth
    );
    const recentTunes: Tune[] = await res.json();
    return recentTunes;
}

function RouteComponent() {
    const {auth} = Route.useRouteContext();
    const recentTunes: Tune[] = Route.useLoaderData();

    return (
        <div className="bg-slate-50/50 min-h-screen"> 
            <div className='max-w-7xl mr-auto pt-12 px-6'>
                <div className='flex items-end justify-between mb-8'>
                    <div>
                        <h2 className='text-3xl font-bold text-slate-900 tracking-tight'>Recent Tunes</h2>
                        <p className='text-slate-500 mt-1'>Continue where you left off with your latest builds.</p>
                    </div>
                    
                    <div className='flex items-center gap-6'>
                        <div className='group relative'>
                            <Link 
                                to={'/u/$user'} 
                                params={{user: auth.user!.username}}
                                className="text-sm font-semibold text-slate-600 hover:text-black transition-colors"
                            >
                                View all builds
                            </Link>
                            <div className='absolute -bottom-1 left-0 w-0 h-0.5 duration-300 group-hover:w-full bg-black'></div>
                        </div>
                    </div>
                </div>

                {recentTunes.length > 0 ? (
                    <Carousel user={auth.user!.username} recentTunes={recentTunes} />   
                ) : (
                    <div className='mt-12 py-20 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-white'>
                        <p className="text-slate-400 font-medium">No tunes created yet.</p>
                        <Link to='/browse' className='bg-slate-900 text-white px-6 py-2 rounded-full font-medium mt-4 hover:bg-slate-800 transition-all active:scale-95'>
                            Create your first tune
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
