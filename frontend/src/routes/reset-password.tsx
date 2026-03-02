import { createFileRoute, notFound, Link, useNavigate } from '@tanstack/react-router'
import { BACKEND } from '../config/env';
import { useState, type FormEvent } from 'react';
import { usePasswordStrength } from '../hooks/usePasswordStrength';
import { PasswordStrengthChecklist } from '../components/PasswordStrengthChecklist';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search: Record<string, unknown>) => {
    const token = search.token as string | undefined
    return {
      token
    }
  },
  loaderDeps: ({search: {token}}) => ({token}),
  loader: async({deps}) => {
    if(!deps.token || deps.token.length !== 64){
      throw notFound();
    }
    const res = await fetch(`${BACKEND}/auth/verify-reset-link?token=${deps.token}`);
    if(!res.ok){
      if(res.status === 404){
        throw notFound();
      }
    }
  },
  notFoundComponent: NotFoundComponent,
  component: RouteComponent,
})

function NotFoundComponent(){
  return (
    <div className='pt-17 flex items-center justify-center min-h-screen'>
      <div className='text-center'>
        <h1 className='text-2xl font-semibold text-gray-800 mb-2'>Invalid or Expired Link</h1>
        <p className='text-gray-600'>This password reset link is no longer valid.</p>
      </div>
    </div>
  )
}

function RouteComponent() {
  const navigate = useNavigate();
  const {token} = Route.useSearch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const {pwdStrength, validatePassword, isPasswordValid} = usePasswordStrength();  

  const handleNewPasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  }

  const handleUpdatePassword = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(confirmPassword === password && isPasswordValid() && token){
      console.log("updating password");
      updatePassword.mutate({token, newPassword: password});
    }
  }

  const updatePassword = useMutation({
    mutationFn: async({ token, newPassword }: { token: string, newPassword: string }) => {
      const res = await fetch(`${BACKEND}/auth/reset-password?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      })
      const {message} = await res.json();
      if(!res.ok){
        if(res.status === 404){
          throw notFound();
        }else{
          throw Error(message);
        }
      }
    },
    onError: (err) => toast.error(err.message),
    onSuccess: () => {
      toast.success('Password reset succesful!');
      navigate({to: '/login', replace: true});
    }
  })

  return (
    <div className="min-h-screen pt-17 flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 border border-gray-200">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-4">
            <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Reset Your Password
          </h1>
          <p className="text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleUpdatePassword}>
          {/* New Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handleNewPasswordInput}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                placeholder="Enter your new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
              <PasswordStrengthChecklist strength={pwdStrength} />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                placeholder="Re-enter your new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-600 mt-2">Passwords do not match</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={updatePassword.isPending}
            className="w-full py-2.5 px-4 bg-gray-900 hover:bg-black text-white font-medium rounded-lg shadow-sm hover:shadow-md transition"
          >
            Reset Password
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <Link to={"/login"} className="font-medium text-gray-900 hover:text-black hover:underline transition">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
