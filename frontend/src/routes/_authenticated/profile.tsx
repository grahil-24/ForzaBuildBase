import { createFileRoute } from '@tanstack/react-router'
import type { AuthState } from '../../types/auth';
import { authFetch } from '../../api/authFetch';
import { BACKEND } from '../../config/env';
import type { RecentTunes } from '../../types/tune';
import { Carousel } from '../../components/profile/Carousel/CarouselIndex';
import { useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { RenameDialogModal } from '../../components/profile/RenameDialogModal';
import {toast} from 'react-toastify';
// import ErrorToast from '../../components/ErrorToast';

const ProfileErrorComponent = ({error}: {error: Error}) => {
    useEffect(() => {
        toast.error(error.message);
    }, [error.message]);
    return null; // Just show toast, no UI
};

export const Route = createFileRoute('/_authenticated/profile')({
    loader: ({context}) => fetchProfile(context.auth),
    preload: true,
    component: RouteComponent,
    errorComponent: ProfileErrorComponent
})

const fetchProfile = async (auth: AuthState) => {
    const res = await authFetch(`${BACKEND}/profile/recent-tunes`,
        {method: 'GET'},
        auth
    );

    // if(!res.ok){
    //     throw new Error('Failed to fetch profile');
    // }

    const recentTunes: RecentTunes[] = await res.json();
    return recentTunes;
}

function RouteComponent() {
    const {auth} = Route.useRouteContext();
    const recentTunes: RecentTunes[] = Route.useLoaderData();
    const [renameModalOpen, setRenameModalOpen] = useState<boolean>(false);
    const [selectedTuneId, setSelectedTuneId] = useState<number | null>(null);

    const handleOpenRenameModal = (tuneId: number) => {
        setSelectedTuneId(tuneId);
        setRenameModalOpen(true);
    };

    const renameTune = useMutation({
        mutationFn: ({newName, tune_id}: {newName: string, tune_id: number}) => {
            return authFetch(`${BACKEND}/tune/${tune_id}/rename`, 
            {method: 'PATCH', body: JSON.stringify({name: newName}), headers: {'Content-Type': 'application/json'}},
            auth);
        },
        onSuccess: () => {
            setTimeout(() => setRenameModalOpen(false), 1500);
        },
        onError: (error) => {
            toast.error(error?.message || 'Failed to rename tune');
        }
    });
    return (
        <> 
            {/* <ErrorToast /> */}
            <RenameDialogModal 
            openModal={renameModalOpen}
            onClose={() => {
                renameTune.reset();
                setRenameModalOpen(false);
            }}
            onSubmit={(newName) => renameTune.mutate({newName, tune_id: selectedTuneId!})}
            isLoading={renameTune.isPending}
            isSuccess={renameTune.isSuccess}
            />
            <div className='max-w-4/5 pt-10 min-w-sm'>
                <div className='flex items-center justify-center'>
                    <div className='text-2xl ml-10'>Recent Tunes</div>
                    <div className='ml-auto'>View all</div>
                </div>
                <Carousel user={auth.user!.username} recentTunes={recentTunes} onRenameClick={handleOpenRenameModal}/>   
            </div>
        </>
    )

}
