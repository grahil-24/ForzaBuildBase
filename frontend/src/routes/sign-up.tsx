import { createFileRoute, redirect } from "@tanstack/react-router";
import type React from "react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useUsernameAvailability } from "../hooks/useUsernameAvailability";

export const Route = createFileRoute('/sign-up')({
    validateSearch: (search)=> ({
        redirect: (search.redirect as string) || '/profile'
    }),
    beforeLoad: ({context, search}) => {
        //redirect if already authenticated
        if(context.auth.isAuthenticated){
            throw redirect({to: search.redirect})
        }
    },
    component: Signup
})

const PasswordValiditySVG = ({valid}:{valid: boolean}): React.ReactElement => {
    return (
        <>
        {!valid ? (
        <svg width="20px" height="20px" viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.96967 16.4697C6.67678 16.7626 6.67678 17.2374 6.96967 17.5303C7.26256 17.8232 7.73744 17.8232 8.03033 17.5303L6.96967 16.4697ZM13.0303 12.5303C13.3232 12.2374 13.3232 11.7626 13.0303 11.4697C12.7374 11.1768 12.2626 11.1768 11.9697 11.4697L13.0303 12.5303ZM11.9697 11.4697C11.6768 11.7626 11.6768 12.2374 11.9697 12.5303C12.2626 12.8232 12.7374 12.8232 13.0303 12.5303L11.9697 11.4697ZM18.0303 7.53033C18.3232 7.23744 18.3232 6.76256 18.0303 6.46967C17.7374 6.17678 17.2626 6.17678 16.9697 6.46967L18.0303 7.53033ZM13.0303 11.4697C12.7374 11.1768 12.2626 11.1768 11.9697 11.4697C11.6768 11.7626 11.6768 12.2374 11.9697 12.5303L13.0303 11.4697ZM16.9697 17.5303C17.2626 17.8232 17.7374 17.8232 18.0303 17.5303C18.3232 17.2374 18.3232 16.7626 18.0303 16.4697L16.9697 17.5303ZM11.9697 12.5303C12.2626 12.8232 12.7374 12.8232 13.0303 12.5303C13.3232 12.2374 13.3232 11.7626 13.0303 11.4697L11.9697 12.5303ZM8.03033 6.46967C7.73744 6.17678 7.26256 6.17678 6.96967 6.46967C6.67678 6.76256 6.67678 7.23744 6.96967 7.53033L8.03033 6.46967ZM8.03033 17.5303L13.0303 12.5303L11.9697 11.4697L6.96967 16.4697L8.03033 17.5303ZM13.0303 12.5303L18.0303 7.53033L16.9697 6.46967L11.9697 11.4697L13.0303 12.5303ZM11.9697 12.5303L16.9697 17.5303L18.0303 16.4697L13.0303 11.4697L11.9697 12.5303ZM13.0303 11.4697L8.03033 6.46967L6.96967 7.53033L11.9697 12.5303L13.0303 11.4697Z" fill="#000000"/>
        </svg>
        ): (
            <svg width="20px" height="20px" viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M17.4995 7.44055C17.8085 7.71643 17.8353 8.19054 17.5595 8.49952L10.4166 16.4995C10.2743 16.6589 10.0708 16.75 9.85715 16.75C9.6435 16.75 9.43999 16.6589 9.2977 16.4995L6.44055 13.2995C6.16468 12.9905 6.19152 12.5164 6.5005 12.2406C6.80947 11.9647 7.28359 11.9915 7.55946 12.3005L9.85715 14.8739L16.4406 7.5005C16.7164 7.19152 17.1905 7.16468 17.4995 7.44055Z" fill="#00ff41"></path> 
                </g>
            </svg>
        )}
        </>
    )
}

const PasswordValidation = {
    min_chars: false,
    uppercase_char_present: false,
    numerical_char_present: false
}

function Signup(): React.ReactElement {
    const {auth} = Route.useRouteContext();
    const {redirect} = Route.useSearch();
    const navigate = Route.useNavigate();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [loading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [pwdStrength, setPwdStrength] = useState<typeof PasswordValidation>(PasswordValidation);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const {isChecking, isAvailable, isError} = useUsernameAvailability(username);

    const handlePasswordAndStrength = (e: React.ChangeEvent<HTMLInputElement>) => {
        const password = e.target.value;
        const min_chars: boolean = password.length >= 8;
        const uppercase_char_present: boolean = /[A-Z]/.test(password);
        const numerical_char_present: boolean = /[0-9]/.test(password);
        setPwdStrength({min_chars, uppercase_char_present, numerical_char_present});
        setPassword(password);
    }

    const isPasswordValid = (): boolean => {
        const values: boolean[] = Object.values(pwdStrength);
        if(values.includes(false)){
            return false;
        }
        return true;
    }

    const isUsernameValid = (): boolean => {
        return isAvailable || false;
    }

    const handleSignupForm = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!isPasswordValid() || !isUsernameValid()){
            setError('Password or username doesnt meet the criteria!');
            setTimeout(() => {
                setError('');
            }, 1000)
        }else {
            setIsLoading(true);
            setError('');

            try{
                await auth.signup(username, email, password);
                navigate({to: redirect as never});
            }catch(err: unknown){
                if(err instanceof TypeError){
                    setError('Unable to connect to server. Please check your connection and try again.')
                }else if(err instanceof Error){
                    setError(err.message)
                }
            }finally{
                setIsLoading(false);
            }
        }
    }

    return (
        <>
        <div className="flex min-h-full flex-col justify-center px-6 py-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img
                alt="Forza Build Base"
                src="/logo/header.png"
                className="mx-auto h-10 w-auto"
            />
            <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                Create your account
            </h2>
            </div>
            
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            {error && <div className="mb-3 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded">{error}</div>}
            <form onSubmit={handleSignupForm} className="space-y-6">
                <div>
                <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900">
                    Username
                </label>
                <div className="mt-2">
                    <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                {/* Feedback */}
                {isChecking && (
                    <p className="text-xs text-gray-500 mt-1">Checking username…</p>
                )}

                {isAvailable === false && (
                    <p className="text-xs text-red-500 mt-1">Username already taken</p>
                )}

                {isAvailable === true && (
                    <p className="text-xs text-green-600 mt-1">Username available</p>
                )}

                {isError && (
                    <p className="text-xs text-red-500 mt-1">
                    Unable to check username right now
                    </p>
                )}
                </div>
                <div>
                <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                    Email address
                </label>
                <div className="mt-2">
                    <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                </div>

                <div>
                <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                    Password
                    </label>
                </div>
                <div className="mt-2 relative">
                    <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    onChange={handlePasswordAndStrength}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer">
                        <FontAwesomeIcon className="cursor-pointer" onClick={() => setShowPassword(prev => !prev)} icon={showPassword ? faEyeSlash : faEye} />
                    </div>
                </div>
                <div className="pt-2">
                    <ul className="font-light text-sm">
                        <li><span className="inline-flex"><PasswordValiditySVG valid={pwdStrength.min_chars}/><p>Minimum 8 characters</p></span></li>
                        <li><span className="inline-flex"><PasswordValiditySVG valid={pwdStrength.uppercase_char_present}/><p>Atleast one uppercase character</p></span></li>
                        <li><span className="inline-flex"><PasswordValiditySVG valid={pwdStrength.numerical_char_present}/><p>Atleast one numerical character</p></span></li>
                    </ul>
                </div>
                </div>
                <div>
                <button
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    {loading ? 'Signing up ...' : 'Sign up'}
                </button>
                </div>
            </form>

            <p className="mt-10 text-center text-sm/6 text-gray-500">
                Already a user?{' '}
                <a href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                Login
                </a>
            </p>
            </div>
        </div>
        </>
    )
}
