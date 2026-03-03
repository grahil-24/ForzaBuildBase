import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import type React from "react";
import { useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useUsernameAvailability } from "../hooks/useUsernameAvailability";
import { usePasswordStrength } from "../hooks/usePasswordStrength";
import { PasswordStrengthChecklist } from "../components/PasswordStrengthChecklist";
import { AuthContext } from "../contexts/Auth/AuthContext";

export const Route = createFileRoute('/sign-up')({
    validateSearch: (search): {redirect?: string} => ({
        redirect: (search.redirect as string) || '/dashboard'
    }),
    beforeLoad: ({context, search}) => {
        //redirect if already authenticated
        if(context.auth.isAuthenticated){
            throw redirect({to: search.redirect})
        }
    },
    head: () => ({
    meta: [
        {
            title: 'Sign up'
        }
    ]
  }),
    component: Signup
})

function Signup(): React.ReactElement {
    const auth = useContext(AuthContext);
    const {redirect} = Route.useSearch();
    const navigate = Route.useNavigate();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [loading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const {isChecking, isAvailable, isError} = useUsernameAvailability(username);
    const {pwdStrength, validatePassword, isPasswordValid} = usePasswordStrength();

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        validatePassword(newPassword);
    }

    const handleSignupForm = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!isPasswordValid() || !isAvailable){
            setError('Password or username doesnt meet the criteria!');
            setTimeout(() => {
                setError('');
            }, 1000)
        }else {
            setIsLoading(true);
            setError('');

            try{
                const mail = email; 
                await auth?.signup(username, email, password);
                navigate({to: '/verify-email', search: {redirect}, state: {email: mail}});
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
                    onChange={handlePasswordChange}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 ">
                        <FontAwesomeIcon className="" onClick={() => setShowPassword(prev => !prev)} icon={showPassword ? faEyeSlash : faEye} />
                    </div>
                </div>
                <div className="pt-2">
                    <PasswordStrengthChecklist strength={pwdStrength} />
                </div>
                </div>
                <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    {loading ? 'Signing up ...' : 'Sign up'}
                </button>
                </div>
            </form>

            <p className="mt-10 text-center text-sm/6 text-gray-500">
                Already a user?{' '}
                <Link to={'/login'} className="font-semibold text-indigo-600 hover:text-indigo-500">
                Login
                </Link>
            </p>
            </div>
        </div>
        </>
    )
}
