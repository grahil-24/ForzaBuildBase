import { createFileRoute, redirect, useNavigate, useRouterState } from '@tanstack/react-router'
import { useState, type KeyboardEvent, type ClipboardEvent, useRef, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/Auth/AuthContext';
import { BACKEND } from '../config/env';

export const Route = createFileRoute('/verify-email')({
     beforeLoad: ({location, context}) => {
        // Redirect if already authenticated
        if(context.auth.isAuthenticated){
            throw redirect({to: '/dashboard'});
        }

        // Check if email exists in location state
        const state = location.state as { email?: string };
        if (!state?.email) {
            // No email in state, redirect to signup
            throw redirect({to: '/sign-up'});
        }
    },
    validateSearch: (search): { redirect?: string } => ({
        redirect: (search.redirect as string) || '/dashboard'
    }),
    component: RouteComponent,
})

function RouteComponent() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const {email} = useRouterState({select: s => s.location.state});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [lastSentTime, setLastSentTime] = useState<number>(Date.now());
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer effect
  useEffect(() => {
    const updateCooldown = () => {
      const elapsed = Math.floor((Date.now() - lastSentTime) / 1000);
      const remaining = Math.max(0, 60 - elapsed);
      setResendCooldown(remaining);
    };

    updateCooldown(); // Initial update

    if (resendCooldown > 0) {
      const timer = setInterval(updateCooldown, 1000);
      return () => clearInterval(timer);
    }
  }, [lastSentTime, resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single character
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split('').concat(['', '', '', '', '', '']).slice(0, 6);
    setCode(newCode);
    
    // Focus last filled input or first empty
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await auth?.verifyEmail(email!, verificationCode);
      navigate({ to: redirect as never });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError('');
    
    try {
      // Your resend API call here
      const res = await fetch(`${BACKEND}/auth/resend-verification-mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });
      if(!res.ok){
        const data = await res.json();
        throw new Error(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      // Update last sent time and reset cooldown
      setLastSentTime(Date.now());
      setResendCooldown(60);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">Verify Your Email</h1>
          <p className="text-gray-600">
            We've sent a 6-digit code to {email}
            <br />
            Please enter it below to continue.
          </p>
        </div>

        {/* Code Input */}
        <div className="mb-6">
          <div className="flex gap-2 justify-center mb-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors"
                disabled={isLoading}
              />
            ))}
          </div>
          
          {error && (
            <p className="text-red-600 text-sm text-center mt-2">{error}</p>
          )}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={isLoading || code.join('').length !== 6}
          className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mb-4"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Verifying...
            </span>
          ) : (
            'Verify Email'
          )}
        </button>

        {/* Resend Code */}
        <div className="text-center">
          <p className="text-gray-600 text-sm mb-2">Didn't receive the code?</p>
          <button
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0}
            className="text-black font-semibold hover:underline disabled:text-gray-400 disabled:no-underline transition-colors"
          >
            {isResending 
              ? 'Sending...' 
              : resendCooldown > 0 
                ? `Resend Code (${resendCooldown}s)` 
                : 'Resend Code'
            }
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Check your spam folder if you don't see the email.
          </p>
        </div>
      </div>
    </div>
  );
}