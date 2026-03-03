import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { BACKEND } from '../config/env';

export const Route = createFileRoute('/forgot-password')({
  beforeLoad: ({context}) => {
    if(context.auth.isAuthenticated){
      throw redirect({
        to: '/dashboard',
        replace: true
      })
    }
  },
  head: () => ({
    meta: [
        {
            title: 'Forgot password'
        }
    ]
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const [email, setEmail] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Cooldown state in seconds
  const [cooldown, setCooldown] = useState<number>(0);

  // Countdown effect
  useEffect(() => {
    // In the browser, the timer ID is a number
    let timer: number | undefined; 

    if (cooldown > 0) {
      timer = window.setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }

    // Cleanup function to clear the interval when component unmounts 
    // or when cooldown reaches 0
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${BACKEND}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        const { message } = await res.json();
        setError(message || "Invalid email address.");
        setIsLoading(false);
        return;
      }

      // Success
      setIsLoading(false);
      setIsSubmitted(true);
      setCooldown(60);
    } catch (err) {
      setError("Something went wrong. Please try again later.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans antialiased text-zinc-900">
      <div className="max-w-md w-full">
        {!isSubmitted ? (
          <div className="bg-white border border-zinc-200 p-8 rounded-2xl shadow-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Forgot password?</h2>
              <p className="text-zinc-500 mt-2">
                No worries, it happens. We'll send you a link to reset it.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-zinc-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="name@company.com"
                  className={`w-full px-4 py-3 bg-zinc-50 border rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-none transition-all ${
                    error ? 'border-black ring-1 ring-black' : 'border-zinc-200 focus:ring-2 focus:ring-black/5 focus:border-zinc-400'
                  }`}
                />
                {error && <p className="text-xs font-bold mt-2 text-red-600 uppercase tracking-tight italic">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-zinc-900 text-white font-medium rounded-lg hover:bg-black transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-zinc-200"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link to={"/login"} className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors inline-flex items-center gap-2">
                <ArrowLeftIcon className='size-4'/>
                Back to login
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 p-8 rounded-2xl shadow-sm text-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Check your email</h2>
            <p className="text-zinc-500 mb-8">
              We've sent instructions to <span className="text-zinc-900 font-semibold">{email}</span>.
            </p>
            
            <button
              onClick={() => {
                if (cooldown === 0) setIsSubmitted(false);
              }}
              disabled={cooldown > 0}
              className={`w-full py-3 px-4 font-semibold rounded-lg transition-all border ${
                cooldown > 0 
                ? 'bg-white border-zinc-200 text-zinc-400 cursor-not-allowed' 
                : 'bg-zinc-100 border-transparent text-zinc-900 hover:bg-zinc-200'
              }`}
            >
              {cooldown > 0 ? `Resend available in ${cooldown}s` : "Didn't receive it? Try again"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}