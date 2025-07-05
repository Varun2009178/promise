"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Auto focus the email input
    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
    if (emailInput) {
      emailInput.focus();
    }
  }, []);

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length >= 5;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Find user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (userError) {
        if (userError.code === 'PGRST116') {
          setMessage('No account found with this email. Please make a promise first to create your account.');
        } else {
          setMessage('Something went wrong. Please try again.');
        }
        return;
      }

      // Redirect to their dashboard
      router.push(`/dashboard/${userData.id}`);
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Failed to log in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#1a1a1a]">
      <div className="w-full max-w-md">
        <h1 className="text-3xl sm:text-4xl md:text-5xl text-white text-center font-light mb-8 sm:mb-12">
          Welcome Back
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6 sm:gap-8">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full text-lg sm:text-xl text-center bg-transparent border-none 
                      text-white focus:outline-none focus:ring-0 placeholder-gray-600
                      border-b border-gray-600 pb-2 focus:border-white transition-colors"
            autoFocus
          />

          {message && (
            <p className="text-red-400 text-center text-sm sm:text-base max-w-sm">
              {message}
            </p>
          )}
          
          <p className="text-gray-400 text-center text-sm sm:text-base">
            Enter your email to continue to your dashboard
          </p>

          <button
            type="submit"
            disabled={!isValidEmail(email) || isLoading}
            className={cn(
              "px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl bg-white text-black rounded-full transition-all font-medium",
              (!isValidEmail(email) || isLoading) ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
            )}
          >
            {isLoading ? 'Loading...' : 'Continue'}
          </button>
        </form>

        <p className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
          >
            ← Back to home
          </button>
        </p>
      </div>
    </div>
  );
} 