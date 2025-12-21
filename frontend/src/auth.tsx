import React, {createContext, useContext, useState, useEffect} from 'react';
import type { AuthState } from './types/auth';
import {PulseLoader} from 'react-spinners';

interface User {
    user_id: number,
    username: string,
    email?: string,
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const BACKEND = import.meta.env.VITE_BACKEND;

export function AuthProvider({children}: {children: React.ReactNode}){
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    //restore auth state on app load
    useEffect(() => {
        console.log("inside auth useeffect");
        // const token = localStorage.getItem('access_token')
        // if(accessToken){
        //     //validate access token with backend
        //     fetch(`${BACKEND}/auth/verify`, {
        //         headers: {Authorization: `Bearer ${accessToken}`},
        //         credentials: 'include'
        //     })
        //     .then((response) => response.json())
        //         //valid access token or successfully refreshed token
        //     .then((userData) => {
        //         if(userData.status === 'success'){
        //         //if access token got refreshed, update it in localstorage
        //             if(userData.access_token){
        //                 localStorage.setItem('access_token', userData.access_token);
        //             }
        //             setAccessToken(localStorage.getItem('access_token'));
        //             setUser(userData.user);
        //             setIsAuthenticated(true);
        //         }else{
        //             setAccessToken(null);
        //             localStorage.removeItem('access_token');
        //         }
        //     })
        //     .catch(() => {
        //         setAccessToken(null);
        //         localStorage.removeItem('access_token');
        //     })
        //     .finally(() => {
        //         setIsLoading(false);
        //     })
        // }else{
        //     setIsLoading(false);
        // }
    
        fetch(`${BACKEND}/auth/refresh`,
            {
                method: 'GET',
                credentials: "include"
            },
        )
        .then((res) => {
            if(!res.ok){
                setAccessToken(null);
                setIsAuthenticated(false);
                setUser(null);
                throw new Error('Refresh failed');
            }else{
                return res.json();
            }
        })
        .then((data) => {
            setAccessToken(data.access_token);
            setIsAuthenticated(true);
            return fetch(`${BACKEND}/profile`, {
                headers: { Authorization: `Bearer ${data.access_token}` },
            });
        })
        .then((res) => res.json())
        .then(userData => {
            setUser(userData);
        })
        .catch(() => {
            setAccessToken(null);
            setIsAuthenticated(false);
            setUser(null);
        })
        .finally(() => {
            setIsLoading(false);
        })
    }, []);

    if(isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <PulseLoader />
            </div>
        )
    }

    const setAccessTokenOnly = (token: string | null) => {
        // Store only in memory, not in localStorage
        console.log("setting token ", token);
        setAccessToken(token);
    }

    const login = async(email: string, password: string) => {
        const response = await fetch(`${BACKEND}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password}),
            credentials: "include"
        })

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        setIsAuthenticated(true);
        setUser(data.user);
        setAccessToken(data.access_token);
    }

    const signup = async(username: string, email: string, password: string) => {
        const response = await fetch(`${BACKEND}/auth/sign-up`,{
            method: "POST",
            credentials: "include",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username, email, password}),
        })

        const data = await response.json();

        if(!response.ok){
            throw new Error(data.message || 'Login failed');
        }

        setUser(data.user);
        setIsAuthenticated(true);
        setAccessToken(data.access_token);
    }

    const logout = async() => {
        setUser(null);
        setIsAuthenticated(false);
        setAccessToken(null);
        //call backend logout api to invalidate refresh cookie
        await fetch(`${BACKEND}/auth/logout`,
            {
                credentials: "include"
            }
        );
    }

    return (
        <AuthContext.Provider value={{isAuthenticated, user, setAccessToken: setAccessTokenOnly, login, logout, signup, accessToken}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext);
    if(context === undefined){
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context;
}