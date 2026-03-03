import type { AuthState } from "../types/auth";
import {authFetch}  from "../api/authFetch";
import { useMutation } from "@tanstack/react-query";
import { BACKEND } from "../config/env";
import {toast} from 'react-toastify'

export const useRemoveTune = (auth: AuthState, onSuccess: () => Promise<void>) => {

    return useMutation({
        mutationFn: async({tune_id}: {tune_id: number}) => {
            await authFetch(`${BACKEND}/tune/${tune_id}/remove`,
                {method: 'DELETE'},
                auth
            )
        },
        onSuccess: async() => await onSuccess(),
        onError: (error) => {
            toast.error(error?.message || 'There was a problem removing the tune');
        }
    })

}