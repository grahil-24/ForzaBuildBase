import { useMutation } from "@tanstack/react-query";
import { authFetch } from "../api/authFetch";
import { toast } from "react-toastify";
import type { AuthState } from "../types/auth";
import { BACKEND } from "../config/env";


export const useRenameTune = (auth: AuthState) => {

    return useMutation({
        mutationFn: async({newName, tune_id}: {newName: string, tune_id: number}) => {
            await authFetch(`${BACKEND}/tune/${tune_id}/rename`, 
            {method: 'PATCH', body: JSON.stringify({name: newName}), headers: {'Content-Type': 'application/json'}},
            auth);
        },
        // onSuccess: async () => { await onSuccess()},
        onError: (error) => {
            toast.error(error?.message || 'Failed to rename tune');
        }
    });
}