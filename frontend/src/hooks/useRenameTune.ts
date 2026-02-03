import { useMutation } from "@tanstack/react-query";
import { authFetch } from "../api/authFetch";
import { toast } from "react-toastify";
import type { AuthState } from "../types/auth";
import { BACKEND } from "../config/env";


export const useRenameTune = (auth: AuthState) => {

    return useMutation({
        mutationFn: async({newName, tune_id}: {newName: string, tune_id: number}) => {
            const res = await authFetch(`${BACKEND}/tune/${tune_id}/rename`, 
            {method: 'PATCH', body: JSON.stringify({name: newName}), headers: {'Content-Type': 'application/json'}},
            auth);
            if(res.status >= 400){
                if(res.status === 409){
                    throw Error('Tune with this name already exists!');
                }
                throw Error('Couldnt rename the tune! Something went wrong, please try again later!')
            }
        },
        // onSuccess: async () => { await onSuccess()},
        onError: (error) => {
            toast.error(error?.message || 'Failed to rename tune');
        }
    });
}