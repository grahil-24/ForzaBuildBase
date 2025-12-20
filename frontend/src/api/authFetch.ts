const BACKEND = import.meta.env.VITE_BACKEND;

export async function authFetch(url: string, options: RequestInit = {},
                                auth: { accessToken: string | null; logout: () => void; setAccessToken: (token: string | null) => void}
) {
    const doFetch = (token: string | null) =>
        fetch(url, {
            ...options,
            headers: {
                ...(options.headers || {}),
                Authorization: token ? `Bearer ${token}` : '',
            },
            credentials: 'include',
        });

    let res = await doFetch(auth.accessToken);

    // access token expired
    if (res.status === 401) {
        //try to refresh access token
        const refreshRes = await fetch(`${BACKEND}/auth/refresh`, {
            credentials: 'include',
        });
        //refresh token expired or invalid
        if (!refreshRes.ok) {
            auth.logout();
            throw new Error('Session expired');
        }
        //access token refreshed
        const data = await refreshRes.json();
        auth.setAccessToken(data.access_token);
        // retry original request
        res = await doFetch(data.access_token);
    }

    return res;
}
