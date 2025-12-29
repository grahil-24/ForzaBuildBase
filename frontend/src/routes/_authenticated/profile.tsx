import { createFileRoute } from '@tanstack/react-router'
import type { AuthState } from '../../types/auth';
import { authFetch } from '../../api/authFetch';
import { BACKEND } from '../../config/env';
import MultiItemCarousel from '../../components/profile/MultiItemCarousel';
import type { RecentTunes } from '../../types/tune';

// interface ProfileData {
//     username: string,
//     user_id: number
// }

export const Route = createFileRoute('/_authenticated/profile')({
    loader: ({context}) => fetchProfile(context.auth),
    preload: true,
    component: RouteComponent,
})

const fetchProfile = async (auth: AuthState) => {
    // console.log("access token in browse ", auth.accessToken);
    // const data = {};
    // let res = await authFetch(`${BACKEND}/profile`,
    //     {method: 'GET'},
    //     auth
    // );

    // if(!res.ok){
    //     throw new Error('Failed to fetch profile');
    // }
    // const user = await res.json();
    const res = await authFetch(`${BACKEND}/profile/recent-tunes`,
        {method: 'GET'},
        auth
    );

    if(!res.ok){
        throw new Error('Failed to fetch profile');
    }

    const recentTunes: RecentTunes[] = await res.json();
    return recentTunes;
}

function RouteComponent() {
    const {auth} = Route.useRouteContext();
    const recentTunes: RecentTunes[] = Route.useLoaderData();
    console.log("profiledata ", recentTunes);
    return (
        <div className='max-w-3/4 pt-10 min-w-md mr-auto'>
            <div className='flex items-center justify-center pb-3'>
                <div className='text-2xl ml-15'>Recent Tunes</div>
                <div className='ml-auto'>View all</div>
            </div>
            {recentTunes.length > 0 && 
                <MultiItemCarousel recentTunes={recentTunes} />
            }
        </div>
    )

}
