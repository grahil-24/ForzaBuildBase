// import { useNavigate } from '@tanstack/react-router';
import React, {createContext, useContext, useState, useEffect} from 'react';

interface User {
    user_id: number,
    email?: string,
}

interface AuthState {
    isAuthenticated: boolean
    user: User | null,
    login: (email: string, password: string) => Promise<void>,
    logout: () => void,
    signup: (email: string, password: string) => Promise<void>,
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const BACKEND = import.meta.env.VITE_BACKEND;

export function AuthProvider({children}: {children: React.ReactNode}){
    // const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    //restore auth state on app load
    useEffect(() => {
        const token = localStorage.getItem('access_token')
        console.log("token ", token);
        if(token){
            //validate access token with backend
            fetch(`${BACKEND}/auth/verify`, {
                headers: {Authorization: `Bearer ${token}`},
                credentials: 'include'
            })
            .then((response) => response.json())
                //valid access token or successfully refreshed token
            .then((userData) => {
                console.log("userdata ", userData);
                if(userData.status === 'success'){
                //if access token got refreshed, update it in localstorage
                    if(userData.access_token){
                        localStorage.setItem('access_token', userData.access_token);
                    }
                    setUser(userData.user);
                    setIsAuthenticated(true);
                }else{
                    localStorage.removeItem('access_token');
                }
            })
            .catch(() => {
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
        })

        if(response.ok){
            const userData = await response.json();
            setIsAuthenticated(true);
            setUser(userData.user);
            //set access token we got in response
            localStorage.setItem('access_token', userData.access_token);
        }else{
            throw new Error('log in  failed');
        }
    }
    
    const signup = async(email: string, password: string) => {
        const response = await fetch(`${BACKEND}/auth/sign-up`,{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, password}),
        })

        if(response.ok){
            const userData = await response.json();
            setUser(userData.user);
            setIsAuthenticated(true);
            localStorage.setItem('access_token', userData.access_token);
        }else{
            throw new Error('An account already exists with this email');
        }
    }

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('access_token');
        // navigate({to: '/'})
    }

    return (
        <AuthContext.Provider value={{isAuthenticated, user, login, logout, signup}}>
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