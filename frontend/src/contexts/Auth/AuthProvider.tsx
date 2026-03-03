import React, {useState, useEffect} from 'react';
import { AuthContext } from './AuthContext';
import {PulseLoader} from 'react-spinners';
import { BACKEND } from '../../config/env';
import { authFetch } from '../../api/authFetch';
import type {User} from '../../types/user';

export function AuthProvider({children}: {children: React.ReactNode}){
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    //restore auth state on app load
    useEffect(() => {
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
            return fetch(`${BACKEND}/me`, {
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
        //remove temporary search history when logging in
        if(localStorage.getItem('SearchHistory')){
            localStorage.removeItem('SearchHistory');
        }
        setIsAuthenticated(true);
        setUser(data.user);
        setAccessToken(data.access_token);
    }

    const signup = async(username: string, email: string, password: string) => {
        const response = await fetch(`${BACKEND}/auth/sign-up`,{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username, email, password}),
        })

        const data = await response.json();

        if(!response.ok){
            throw new Error(data.message || 'Login failed');
        }
        // setUser(data.user);
        // setIsAuthenticated(true);
        // setAccessToken(data.access_token);
    }

    const verifyEmail = async(email: string, verificationCode: string) => {
        const res = await fetch(`${BACKEND}/auth/verify-email`, 
            {
                method: 'POST',
                credentials: 'include',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, verificationCode}),
            }
        )
        const data = await res.json();
        if(!res.ok){
            throw new Error(data.message);
        }
        //remove temporary search history when signing up
        if(localStorage.getItem('SearchHistory')){
            localStorage.removeItem('SearchHistory');
        }
        setUser(data.user);
        setAccessToken(data.access_token);
        setIsAuthenticated(true);
    }


    const logout = async() => {
        //call backend logout api to invalidate refresh cookie
        const res = await fetch(`${BACKEND}/auth/logout`,
            {
                credentials: "include"
            }
        );
        if(!res.ok){
            throw new Error('Failed to logout! Please try again');
        }
        window.location.href = '/';
        //remove temporary search history when logging out
        if(localStorage.getItem('SearchHistory')){
            localStorage.removeItem('SearchHistory');
        }
        setUser(null);
        setIsAuthenticated(false);
        setAccessToken(null);
    }

    const refreshUserData = async () => {
        try {
            const response = await authFetch(`${BACKEND}/me`, {
            method: 'GET'},
            {accessToken, logout, setAccessToken});
            const userData = await response.json();
            setUser(userData);
        } catch (error) {
            console.error('Failed to refresh user data:', error);
        }
    }

    const updateUserProfile = (profile: User | null) => {
        setUser(profile);
    };

    return (
        <AuthContext.Provider value={{isAuthenticated, user, updateUserProfile, setAccessToken: setAccessTokenOnly, login, logout, signup, accessToken, refreshUserData, verifyEmail}}>
            {children}
        </AuthContext.Provider>
    )
}
