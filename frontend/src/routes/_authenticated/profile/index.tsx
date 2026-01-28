import { createFileRoute, useRouter, Link } from '@tanstack/react-router'
import type { AuthState } from '../../../types/auth';
import { authFetch } from '../../../api/authFetch';
import { BACKEND } from '../../../config/env';
import type { Tune } from '../../../types/tune';
import { Carousel } from '../../../components/profile/Carousel/CarouselIndex';
import { useState } from 'react';
import { RenameDialogModal } from '../../../components/profile/RenameDialogModal';
import {RemoveDialogModal} from '../../../components/profile/RemoveDialogModal';
import {toast} from 'react-toastify';
import ErrorToast from '../../../components/ErrorToast';
import { useRemoveTune } from '../../../hooks/useRemoveTune';
import { useRenameTune } from '../../../hooks/useRenameTune';

export const Route = createFileRoute('/_authenticated/profile/')({
    loader: async({context}) => await fetchProfile(context.auth),
    preload: true,
    component: RouteComponent,
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
    const res = await authFetch(`${BACKEND}/profile/recent-tunes`,
        {method: 'GET'},
        auth
    );
    const recentTunes: Tune[] = await res.json();
    return recentTunes;
}

function RouteComponent() {
    const {auth} = Route.useRouteContext();
    const recentTunes: Tune[] = Route.useLoaderData();
    const router = useRouter();

    const [renameModalOpen, setRenameModalOpen] = useState<boolean>(false);
    const [removeModalOpen, setRemoveModalOpen] = useState<boolean>(false);
    const [selectedTuneId, setSelectedTuneId] = useState<number | null>(null);
    const [removeMode, setRemoveMode] = useState<'delete' | 'remove'>('delete');

    const handleOpenRenameModal = (tuneId: number) => {
        setSelectedTuneId(tuneId);
        setRenameModalOpen(true);
    };

    const handleCloseRenameModal = () => {
        setRenameModalOpen(false);
        setSelectedTuneId(null);
    };

    const handleOpenRemoveModal = (tuneId: number) => {
        setSelectedTuneId(tuneId);
        setRemoveMode('remove');
        setRemoveModalOpen(true);
    }

    const handleOpenDeleteModal = (tuneId: number) => {
        setSelectedTuneId(tuneId);
        setRemoveMode('delete');
        setRemoveModalOpen(true);
    }

    const handleRemoveTuneSuccess = async() => {
        toast.success('Tune removed successfully!');
        // as loader data is stale, force router to reload matching routes
        await router.invalidate();
    }

    const handleRenameTuneSuccess = async() => {
        toast.success('Tune renamed successfully!');
        handleCloseRenameModal();
        // as loader data is stale, force router to reload matching routes
        await router.invalidate();
    }
    
    const removeTune = useRemoveTune(auth, handleRemoveTuneSuccess);

    const renameTune = useRenameTune(auth);

    return (
        <div> 
            {/* <ErrorToast /> */}
            <RenameDialogModal 
                openModal={renameModalOpen}
                onClose={handleCloseRenameModal}
                onSubmit={(newName) => {renameTune.mutate({newName, tune_id: selectedTuneId!},
                    {
                        onSuccess: async () => {
                            await handleRenameTuneSuccess();
                            //reset mutations state before closing the modal
                            renameTune.reset();
                        }

                    }
                );}}
                isLoading={renameTune.isPending}
                isSuccess={renameTune.isSuccess}
            />
            <RemoveDialogModal 
                openModal={removeModalOpen}
                onClose={() => {
                    //reset mutations state before closing the modal
                    removeTune.reset();
                    setRemoveModalOpen(false);
                }}
                onSubmit={() => {removeTune.mutate({tune_id: selectedTuneId!}); setRemoveModalOpen(false)}}
                mode={removeMode}
                isLoading={removeTune.isPending}
            />
            <div className='max-w-4/5 pt-10 min-w-sm'>
                <div className='flex justify-between'>
                    <div className='text-2xl ml-10'>Recent Tunes</div>
                    <div className='group inline-block'>
                        <div><Link to={'/profile/tunes'}>View all</Link></div>
                        <div className='w-0 h-0.5 duration-300 group-hover:w-full bg-black'></div>
                    </div>
                </div>
                {recentTunes.length > 0 ? (
                        <Carousel user={auth.user!.username} recentTunes={recentTunes} onRenameClick={handleOpenRenameModal} onRemoveClick={handleOpenRemoveModal} onDeleteClick={handleOpenDeleteModal}/>   
                    ) :
                    (
                        <div className='mt-4 flex-row items-center'>
                            <div className='flex justify-center'>
                                <p>no tunes created yet.</p>
                            </div>
                            <div className='flex items-center justify-center'>
                                <button className='cursor-pointer hover:bg-black hover:text-white duration-200 border-black border-2 p-3 mt-4'>Create tune</button>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )

}
