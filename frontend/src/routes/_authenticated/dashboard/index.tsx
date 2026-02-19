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
        <div> 
            
            <div className='max-w-4/5 pt-10 min-w-sm'>
                <div className='flex justify-between'>
                    <div className='text-2xl ml-10'>Recent Tunes</div>
                    <div className='group inline-block'>
                        <div><Link to={'/u/$user'} params={{user: auth.user!.username}}>View all</Link></div>
                        <div className='w-0 h-0.5 duration-300 group-hover:w-full bg-black'></div>
                    </div>
                </div>
                {recentTunes.length > 0 ? (
                        <Carousel user={auth.user!.username} recentTunes={recentTunes} />   
                    ) :
                    (
                        <div className='mt-4 flex-row items-center'>
                            <div className='flex justify-center'>
                                <p>no tunes created yet.</p>
                            </div>
                            <div className='flex items-center justify-center'>
                                <Link to='/browse' className=' hover:bg-black hover:text-white duration-200 border-black border-2 p-3 mt-4'>Create tune</Link>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )

}
