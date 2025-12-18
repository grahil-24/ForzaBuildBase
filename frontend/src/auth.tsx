// import { useNavigate } from '@tanstack/react-router';
import React, {createContext, useContext, useState, useEffect} from 'react';

interface User {
    user_id: number,
    username?: string, 
    email?: string,
}

interface AuthState {
    isAuthenticated: boolean,
    accessToken: string | null;
    user: User | null,
    login: (email: string, password: string) => Promise<void>,
    logout: () => void,
    signup: (username: string, email: string, password: string) => Promise<void>,
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const BACKEND = import.meta.env.VITE_BACKEND;

export function AuthProvider({children}: {children: React.ReactNode}){
    // const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    //restore auth state on app load
    useEffect(() => {
        const token = localStorage.getItem('access_token')
        if(token){
            //validate access token with backend
            fetch(`${BACKEND}/auth/verify`, {
                headers: {Authorization: `Bearer ${token}`},
                credentials: 'include'
            })
            .then((response) => response.json())
                //valid access token or successfully refreshed token
            .then((userData) => {
                if(userData.status === 'success'){
                //if access token got refreshed, update it in localstorage
                    if(userData.access_token){
                        localStorage.setItem('access_token', userData.access_token);
                    }
                    setAccessToken(localStorage.getItem('access_token'));
                    setUser(userData.user);
                    setIsAuthenticated(true);
                }else{
                    setAccessToken(null);
                    localStorage.removeItem('access_token');
                }
            })
            .catch(() => {
                setAccessToken(null);
                localStorage.removeItem('access-token');
            })
            .finally(() => {
                setIsLoading(false);
            })
        }else{
            setIsLoading(false);
        }
    }, []);


    if(isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                Loading...
            </div>
        )
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
        localStorage.setItem('access_token', data.access_token);
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
        localStorage.setItem('access_token', data.access_token);
    }

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        setAccessToken(null);
        localStorage.removeItem('access_token');
        // navigate({to: '/'})
    }

    return (
        <AuthContext.Provider value={{isAuthenticated, user, login, logout, signup, accessToken}}>
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