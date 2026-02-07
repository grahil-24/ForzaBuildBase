import {useQuery} from '@tanstack/react-query';
import { useDebounce } from './useDebounce';
import { BACKEND } from '../config/env';

interface UsernameAvailabilityResponse {
    available: boolean;
};

export const useUsernameAvailability = (username: string) => {
    const debouncedUsername = useDebounce(username, 500);
    console.log("debounced username ", debouncedUsername);

    const query = useQuery({
        queryKey: ["username-availability", debouncedUsername],
        queryFn: async() : Promise<UsernameAvailabilityResponse> => {
            const res = await fetch(`${BACKEND}/auth/check-username?username=${encodeURIComponent(debouncedUsername)}`, {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            });
            if(!res.ok){
                throw new Error('Unkown error occured');
            }
            return res.json();
        },
        enabled: debouncedUsername.length >= 4,
        retry: false,
        staleTime: 1000 * 60 * 2
    });

    return {
        isChecking: query.isFetching,
        isAvailable: query.data?.available,
        isError: query.isError,
    }
}