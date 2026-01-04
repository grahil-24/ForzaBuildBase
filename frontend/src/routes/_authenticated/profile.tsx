import { createFileRoute, useRouter } from '@tanstack/react-router'
import type { AuthState } from '../../types/auth';
import { authFetch } from '../../api/authFetch';
import { BACKEND } from '../../config/env';
import type { RecentTunes } from '../../types/tune';
import { Carousel } from '../../components/profile/Carousel/CarouselIndex';
import { useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { RenameDialogModal } from '../../components/profile/RenameDialogModal';
import {RemoveDialogModal} from '../../components/profile/RemoveDialogModal';
import {toast} from 'react-toastify';

const ProfileErrorComponent = ({error}: {error: Error}) => {
    useEffect(() => {
        toast.error(error.message);
    }, [error.message]);
    return null; // Just show toast, no UI
};

export const Route = createFileRoute('/_authenticated/profile')({
    loader: async({context}) => await fetchProfile(context.auth),
    preload: true,
    component: RouteComponent,
    errorComponent: ProfileErrorComponent
})

const fetchProfile = async (auth: AuthState) => {
    const res = await authFetch(`${BACKEND}/profile/recent-tunes`,
        {method: 'GET'},
        auth
    );
    const recentTunes: RecentTunes[] = await res.json();
    return recentTunes;
}

function RouteComponent() {
    const {auth} = Route.useRouteContext();
    const recentTunes: RecentTunes[] = Route.useLoaderData();
    const router = useRouter();
    const [renameModalOpen, setRenameModalOpen] = useState<boolean>(false);
    const [removeModalOpen, setRemoveModalOpen] = useState<boolean>(false);
    const [selectedTuneId, setSelectedTuneId] = useState<number | null>(null);

    const handleOpenRenameModal = (tuneId: number) => {
        setSelectedTuneId(tuneId);
        setRenameModalOpen(true);
    };

    const handleOpenRemoveModal = (tuneId: number) => {
        setSelectedTuneId(tuneId);
        setRemoveModalOpen(true);
    }
    
    const renameTune = useMutation({
        mutationFn: async({newName, tune_id}: {newName: string, tune_id: number}) => {
            await authFetch(`${BACKEND}/tune/${tune_id}/rename`, 
            {method: 'PATCH', body: JSON.stringify({name: newName}), headers: {'Content-Type': 'application/json'}},
            auth);
        },
        onSuccess: () => {
            toast.success('Tune renamed successfully!');
            setTimeout(async() => {
                setRenameModalOpen(false); 
                renameTune.reset();
                await router.invalidate();
            }, 1500);
        },
        onError: (error) => {
            toast.error(error?.message || 'Failed to rename tune');
        }
    });

    const removeTune = useMutation({
        mutationFn: async({tune_id}: {tune_id: number}) => {
            await authFetch(`${BACKEND}/tune/${tune_id}/remove`,
                {method: 'DELETE'},
                auth
            )
        },
        onSuccess: () => {
            toast.success('Tune removed successfully!');
            setTimeout(async() => {
                setRemoveModalOpen(false);
                removeTune.reset();
                await router.invalidate();
            }, 1500);
        },
        onError: (error) => {
            toast.error(error?.message || 'There was a problem removing the tune');
        }
    })

    return (
        <> 
            {/* <ErrorToast /> */}
            <RenameDialogModal 
            openModal={renameModalOpen}
            onClose={() => {
                renameTune.reset();
                setRenameModalOpen(false);
            }}
            onSubmit={(newName) => {renameTune.mutate({newName, tune_id: selectedTuneId!});}}
            isLoading={renameTune.isPending}
            isSuccess={renameTune.isSuccess}
            />
            <RemoveDialogModal 
            openModal={removeModalOpen}
            onClose={() => {
                removeTune.reset();
                setRemoveModalOpen(false);
            }}
            onSubmit={() => {removeTune.mutate({tune_id: selectedTuneId!});}}
            isLoading={removeTune.isPending}
            />
            <div className='max-w-4/5 pt-10 min-w-sm'>
                <div className='flex items-center justify-center'>
                    <div className='text-2xl ml-10'>Recent Tunes</div>
                    <div className='ml-auto'>View all</div>
                </div>
                <Carousel user={auth.user!.username} recentTunes={recentTunes} onRenameClick={handleOpenRenameModal} onRemoveClick={handleOpenRemoveModal}/>   
            </div>
        </>
    )

}
