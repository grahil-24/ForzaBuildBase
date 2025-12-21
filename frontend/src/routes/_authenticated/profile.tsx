import { createFileRoute } from '@tanstack/react-router'
import type { AuthState } from '../../types/auth';
import { authFetch } from '../../api/authFetch';

interface ProfileData {
    username: string,
    user_id: number
}

const BACKEND = import.meta.env.VITE_BACKEND;

export const Route = createFileRoute('/_authenticated/profile')({
    loader: ({context}) => fetchProfile(context.auth),
    component: RouteComponent,
})

const fetchProfile = async (auth: AuthState) => {
    console.log("access token in browse ", auth.accessToken);
    const res = await authFetch(`${BACKEND}/profile`,
        {method: 'GET'},
        auth
    );

    if(!res.ok){
        throw new Error('Failed to fetch profile');
    }
    const data = await res.json();
    return data
}

function RouteComponent() {
    const {auth} = Route.useRouteContext();
    const profileData: ProfileData = Route.useLoaderData();
    console.log("profiledata ", profileData);
    return (
        <div className="">
            {/* <Nav /> */}
        <div className="flex justify-between items-center mb-6">
            <button
            onClick={auth.logout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
            Sign Out
            </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Hi {profileData.username}!</h2>
            <p className="text-gray-600">
            Hello, <strong>{auth.user?.username} {auth.user?.user_id}</strong>! You are successfully
            authenticated.
            </p>
            <p className="text-sm text-gray-500 mt-2">id: {auth.user?.user_id}</p>
        </div>
        </div>
    )

}
