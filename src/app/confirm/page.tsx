"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const promise = searchParams.get('promise') || '';
  const urlName = searchParams.get('name') || '';
  const urlEmail = searchParams.get('email') || '';
  
  // Determine initial stage based on URL parameters
  const getInitialStage = () => {
    if (urlName && urlEmail) {
      // If name and email are provided, skip to sustainability
      return 'sustainability';
    } else if (urlName) {
      // If only name is provided, start at email
      return 'email';
    } else {
      // Default flow
      return 'explain';
    }
  };
  
  const [stage, setStage] = useState<'explain' | 'name' | 'email' | 'sustainability' | 'reminder' | 'warning' | 'final' | 'error'>(getInitialStage());
  const [name, setName] = useState(urlName);
  const [email, setEmail] = useState(urlEmail);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isEcoFriendly, setIsEcoFriendly] = useState<boolean | null>(null);
  const [reminderTime, setReminderTime] = useState<string>('morning');

  // Initialize state when URL parameters are present
  useEffect(() => {
    if (urlName && urlEmail) {
      setName(urlName);
      setEmail(urlEmail);
      // If both name and email are provided, skip to sustainability
      if (stage === 'explain' || stage === 'name' || stage === 'email') {
        setStage('sustainability');
      }
    } else if (urlName) {
      setName(urlName);
      // If only name is provided, start at email
      if (stage === 'explain' || stage === 'name') {
        setStage('email');
      }
    }
  }, [urlName, urlEmail, stage]);

  const handleExplainContinue = () => {
    setStage('name');
  };

  const handleNameSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (name.length >= 2) {
      setStage('email');
    }
  };

  // Add click handler for name input container
  const handleNameContainerClick = () => {
    if (stage === 'name' || stage === 'email') {
      setStage('name');
      // Use setTimeout to ensure the input is rendered before focusing
      setTimeout(() => {
        const nameInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (nameInput) {
          nameInput.focus();
        }
      }, 0);
    }
  };

  // Add click handler for email input container
  const handleEmailContainerClick = () => {
    if (stage === 'email') {
      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      if (emailInput) {
        emailInput.focus();
      }
    }
  };

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length >= 5;
  };

  const handleEmailSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isValidEmail(email)) {
      setStage('sustainability');
    }
  };

  const handleSustainabilitySubmit = () => {
    setStage('reminder');
  };

  const handleReminderSubmit = () => {
    setStage('warning');
  };

  // Back navigation function
  const handleBack = () => {
    switch (stage) {
      case 'name':
        setStage('explain');
        break;
      case 'email':
        setStage('name');
        break;
      case 'sustainability':
        setStage('email');
        break;
      case 'reminder':
        setStage('sustainability');
        break;
      case 'warning':
        setStage('reminder');
        break;
      default:
        router.push('/');
        break;
    }
  };

  const handleCreatePromise = async () => {
      setIsSubscribing(true);
      try {
      // Debug: Check if user exists first
      console.log('Checking if user exists before creating...');
      const checkResponse = await fetch(`/api/test-db?email=${encodeURIComponent(email)}`);
      const checkData = await checkResponse.json();
      console.log('User check result:', checkData);

        const response = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, promise, isEcoFriendly, reminderTime }),
        });
      
      const data = await response.json();
      console.log('Subscribe response:', data);
        
        if (!response.ok) {
        if (data.error === 'USER_EXISTS') {
          setErrorMessage(data.message);
          setStage('error');
          return;
        }
        throw new Error(data.message || 'Failed to subscribe');
      }
        
        if (data.success && data.userId) {
            setStage('final');
          setTimeout(() => {
            router.push(`/dashboard/${data.userId}`);
        }, 3000);
        } else {
          throw new Error(data.error || 'Failed to subscribe');
        }
      } catch (error) {
        console.error('Failed to subscribe:', error);
      setErrorMessage('Something went wrong. Please try again.');
      setStage('error');
    } finally {
        setIsSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-[#1a1a1a]">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Back button - only show when not on explain stage */}
      {stage !== 'explain' && stage !== 'final' && stage !== 'error' && (
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6">
          <button
            onClick={handleBack}
            className="px-4 sm:px-6 py-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            Back
          </button>
        </div>
      )}

      <div className="w-full max-w-2xl mx-auto text-center relative z-10">
        {stage === 'explain' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl sm:text-3xl text-white font-light mb-8 sm:mb-12">
              How Promise works
            </h2>
            
            {/* Feature Cards - Unique Design */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 sm:mb-12 max-w-4xl mx-auto">
              {/* Daily Reminders - Circle Design */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-full p-6 text-center aspect-square flex flex-col items-center justify-center">
                  <div className="text-3xl sm:text-4xl mb-3 animate-pulse">⏰</div>
                  <h3 className="text-sm sm:text-base text-white font-medium mb-2">
                    Daily Reminders
                  </h3>
                  <p className="text-gray-300 text-xs">
                    Gentle nudges to stay on track
                  </p>
                </div>
              </div>
              
              {/* One Promise - Hexagon Design */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 transform rotate-3"></div>
                <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="text-3xl sm:text-4xl mb-3">🎯</div>
                  <h3 className="text-sm sm:text-base text-white font-medium mb-2">
                    One Promise
                  </h3>
                  <p className="text-gray-300 text-xs">
                    Single focus, maximum impact
                  </p>
                </div>
              </div>
              
              {/* 24-Hour Rule - Diamond Design */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500 transform -rotate-3"></div>
                <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="text-3xl sm:text-4xl mb-3">🌱</div>
                  <h3 className="text-sm sm:text-base text-white font-medium mb-2">
                    24-Hour Rule
                  </h3>
                  <p className="text-gray-300 text-xs">
                    Intentional waiting period
                  </p>
                </div>
              </div>
            </div>
            
            {/* Promise Preview */}
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6 mb-8">
              <p className="text-lg sm:text-xl text-white font-light mb-2">
                Your promise:
              </p>
              <p className="text-xl sm:text-2xl text-green-300 font-medium italic">
                "{promise}"
              </p>
            </div>
            
            <button
              onClick={handleExplainContinue}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleExplainContinue();
                }
              }}
              className="px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl bg-white text-black rounded-full transition-all font-medium hover:bg-gray-100 active:scale-95 active:bg-gray-200"
              autoFocus
            >
              Yes, let's start
            </button>
          </div>
        )}

        {stage === 'name' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl sm:text-3xl text-white font-light mb-8 sm:mb-12">
              What should we call you?
            </h2>
            <div 
              className="w-full max-w-md mx-auto cursor-text"
            onClick={handleNameContainerClick}
          >
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && name.length >= 2) {
                    handleNameSubmit();
                  }
                }}
                placeholder="Your name"
                className="w-full text-lg sm:text-xl text-center bg-transparent border-none 
                          text-white focus:outline-none focus:ring-0 placeholder-gray-600
                          border-b border-gray-600 pb-2 focus:border-white transition-colors"
                autoFocus
              />
            </div>
              <button
                onClick={handleNameSubmit}
                disabled={name.length < 2}
              className="mt-6 px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl bg-white text-black rounded-full transition-all font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 active:bg-gray-200"
              >
                Continue
              </button>
          </div>
        )}

        {stage === 'email' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl sm:text-3xl text-white font-light mb-8 sm:mb-12">
              Where should we send your daily reminder?
            </h2>
            <div className="w-full max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isValidEmail(email)) {
                    handleEmailSubmit();
                  }
                }}
                placeholder="your@email.com"
                className="w-full text-lg sm:text-xl text-center bg-transparent border-none 
                          text-white focus:outline-none focus:ring-0 placeholder-gray-600
                          border-b border-gray-600 pb-2 focus:border-white transition-colors"
                autoFocus
              />
            </div>
            <button
              onClick={handleEmailSubmit}
              disabled={!isValidEmail(email)}
              className="mt-6 px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl bg-white text-black rounded-full transition-all font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 active:bg-gray-200"
            >
              Continue
            </button>
          </div>
        )}

        {stage === 'sustainability' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl sm:text-3xl text-white font-light mb-8 sm:mb-12">
              Is this promise earth-friendly?
            </h2>
            <p className="text-gray-400 text-sm sm:text-base mb-8">
              We'll add a little 🌱 to completed eco-friendly promises
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setIsEcoFriendly(true);
                  handleSustainabilitySubmit();
                }}
                className="px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl bg-white text-black rounded-full transition-all font-medium hover:bg-gray-100 active:scale-95 active:bg-gray-200"
              >
                Yes, it is 🌱
              </button>
              <button
                onClick={() => {
                  setIsEcoFriendly(false);
                  handleSustainabilitySubmit();
                }}
                className="px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl border border-white/30 text-white rounded-full transition-all font-medium hover:bg-white/10 active:scale-95 active:bg-white/20"
              >
                No, it's not
              </button>
            </div>
          </div>
        )}

        {stage === 'reminder' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl sm:text-3xl text-white font-light mb-8 sm:mb-12">
              When do you want to be reminded?
            </h2>
            <p className="text-gray-400 text-sm sm:text-base mb-8">
              We'll send one gentle reminder each day
            </p>
            <div className="w-full max-w-md mx-auto mb-8">
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setReminderTime('morning');
                    handleReminderSubmit();
                  }}
                  className="w-full text-left px-6 py-4 rounded-xl border border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-lg">Morning</div>
                    <div className="text-xs text-gray-500">recommended</div>
                  </div>
                  <div className="text-sm opacity-70">Start your day with focus</div>
                </button>
                
                <button
                  onClick={() => {
                    setReminderTime('midday');
                    handleReminderSubmit();
                  }}
                  className="w-full text-left px-6 py-4 rounded-xl border border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white transition-all"
                >
                  <div className="font-medium text-lg">Midday</div>
                  <div className="text-sm opacity-70">Check in during lunch</div>
                </button>
                
                <button
                  onClick={() => {
                    setReminderTime('evening');
                    handleReminderSubmit();
                  }}
                  className="w-full text-left px-6 py-4 rounded-xl border border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white transition-all"
          >
                  <div className="font-medium text-lg">Evening</div>
                  <div className="text-sm opacity-70">Reflect before bed</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {stage === 'warning' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl sm:text-3xl text-white font-light mb-6 sm:mb-8">
              Important
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 sm:mb-12 leading-relaxed">
              You're about to make a promise to yourself, {name}. 
              <br />
              Are you ready to commit to this?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleCreatePromise}
                disabled={isSubscribing}
                className="px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl bg-white text-black rounded-full transition-all font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 active:bg-gray-200"
              >
                {isSubscribing ? 'Creating...' : 'Yes, I\'m ready'}
              </button>
              <button
                onClick={() => router.push(`/think?promise=${encodeURIComponent(promise)}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`)}
                className="px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl border border-white/30 text-white rounded-full transition-all font-medium hover:bg-white/10 active:scale-95 active:bg-white/20"
              >
                Let me think
              </button>
            </div>
          </div>
        )}

        {stage === 'final' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl sm:text-3xl text-white font-light mb-6 sm:mb-8">
              Creating your promise...
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 sm:mb-12">
              Setting up your dashboard for {name}
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          </div>
        )}

        {stage === 'error' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl sm:text-3xl text-white font-light mb-6 sm:mb-8">
              Account Already Exists
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 sm:mb-12 leading-relaxed">
              {errorMessage}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/login')}
                className="px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl bg-white text-black rounded-full transition-all font-medium hover:bg-gray-100 active:scale-95 active:bg-gray-200"
              >
                Go to Login
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl border border-white/30 text-white rounded-full transition-all font-medium hover:bg-white/10 active:scale-95 active:bg-white/20"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 