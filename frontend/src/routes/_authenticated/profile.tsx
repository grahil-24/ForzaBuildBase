import { createFileRoute } from '@tanstack/react-router'
import type { AuthState } from '../../types/auth';
import { authFetch } from '../../api/authFetch';
import { BACKEND } from '../../config/env';
// import MultiItemCarousel from '../../components/profile/MultiItemCarousel';
import type { RecentTunes } from '../../types/tune';
import { Carousel } from '../../components/profile/Carousel/CarouselIndex';

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
        <div className='max-w-4/5 pt-10 min-w-sm'>
            <div className='flex items-center justify-center'>
                <div className='text-2xl ml-10'>Recent Tunes</div>
                <div className='ml-auto'>View all</div>
            </div>
            <Carousel user={auth.user?.username} recentTunes={recentTunes} />
        </div>
    )

}
