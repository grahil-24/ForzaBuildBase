import { useRouter } from "@tanstack/react-router";
import type { AuthState } from "../types/auth";
import {authFetch}  from "../api/authFetch";
import { useMutation } from "@tanstack/react-query";
import { BACKEND } from "../config/env";
import {toast} from 'react-toastify'

export const useRemoveTune = (auth: AuthState) => {

    const router = useRouter();

    return useMutation({
        mutationFn: async({tune_id}: {tune_id: number}) => {
            await authFetch(`${BACKEND}/tune/${tune_id}/remove`,
                {method: 'DELETE'},
                auth
            )
        },
        onSuccess: () => {
            toast.success('Tune removed successfully!');
            setTimeout(async() => {
                await router.invalidate();
            }, 1500);
        },
        onError: (error) => {
            toast.error(error?.message || 'There was a problem removing the tune');
        }
    })

}