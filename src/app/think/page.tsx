"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";

export default function ThinkPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const promise = searchParams.get('promise') || '';
  const name = searchParams.get('name') || '';
  const email = searchParams.get('email') || '';
  
  const [breathCount, setBreathCount] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const [stage, setStage] = useState<'initial' | 'breathing' | 'reflection' | 'decision'>('initial');
  const [timeLeft, setTimeLeft] = useState(3); // 3 seconds per phase

  useEffect(() => {
    if (stage === 'breathing') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setBreathCount(prevCount => {
              if (prevCount >= 3) { // 3 complete breaths
                setStage('reflection');
                return prevCount;
              }
              return prevCount + 1;
            });
            return 3; // Reset to 3 seconds
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [stage]);

  const startBreathing = () => {
    setIsBreathing(true);
    setStage('breathing');
  };

  const handleCommit = async () => {
    try {
      // Create the promise directly and go to dashboard
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promise,
          name,
          email,
          reminderTime: 'morning', // Default to morning
          isEcoFriendly: false // Default to false
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect directly to dashboard
        router.push(`/dashboard/${data.userId}`);
      } else {
        console.error('Failed to create promise');
        // Fallback to confirm page if there's an error
        router.push(`/confirm?promise=${encodeURIComponent(promise)}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      console.error('Error creating promise:', error);
      // Fallback to confirm page if there's an error
      router.push(`/confirm?promise=${encodeURIComponent(promise)}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  const getBreathPhase = () => {
    const phase = breathCount % 4;
    if (phase === 0) return "Breathe in...";
    if (phase === 1) return "Hold...";
    if (phase === 2) return "Breathe out...";
    return "Hold...";
  };

  const getBreathScale = () => {
    const phase = breathCount % 4;
    if (phase === 0) return "scale-150"; // Inhale - expand
    if (phase === 1) return "scale-150"; // Hold - stay expanded
    if (phase === 2) return "scale-100"; // Exhale - contract
    return "scale-100"; // Hold - stay contracted
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

      {/* Back button */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6">
        <button
          onClick={handleBack}
          className="px-4 sm:px-6 py-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          Back
        </button>
      </div>

      <div className="w-full max-w-2xl mx-auto text-center relative z-10">
        {stage === 'initial' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl sm:text-3xl text-white font-light mb-8 sm:mb-12">
              Take a moment to reflect
            </h2>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 mb-8">
              <p className="text-lg sm:text-xl text-white font-light leading-relaxed mb-6">
                "{promise}"
              </p>
              <p className="text-gray-400 text-sm sm:text-base">
                This is your promise to yourself
              </p>
            </div>
            <button
              onClick={startBreathing}
              className="px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl bg-white text-black rounded-full transition-all font-medium hover:bg-gray-100 active:scale-95 active:bg-gray-200"
            >
              Reflect on this promise
            </button>
          </div>
        )}

        {stage === 'breathing' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl sm:text-3xl text-white font-light mb-8 sm:mb-12">
              {getBreathPhase()}
            </h2>
            
            {/* Animated Timer Circle */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className={cn(
                "w-32 h-32 rounded-full border-2 border-white/30 transition-all duration-1000",
                getBreathScale()
              )} />
              
              {/* Timer Progress Ring */}
              <div className="absolute inset-0 w-32 h-32 rounded-full">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 60}`}
                    strokeDashoffset={`${2 * Math.PI * 60 * (1 - timeLeft / 3)}`}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
              </div>
              
              {/* Time Display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl text-white font-light">{timeLeft}</span>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm sm:text-base">
              Breath {Math.floor(breathCount / 4) + 1} of 3
            </p>
          </div>
        )}

        {stage === 'reflection' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl sm:text-3xl text-white font-light mb-8 sm:mb-12">
              How does this feel?
            </h2>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 mb-8">
              <p className="text-lg sm:text-xl text-white font-light leading-relaxed mb-6">
                "{promise}"
              </p>
              <p className="text-gray-400 text-sm sm:text-base">
                This commitment is for you, and only you
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleCommit}
                className="px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl bg-white text-black rounded-full transition-all font-medium hover:bg-gray-100 active:scale-95 active:bg-gray-200"
              >
                I'm ready to commit
              </button>
              <button
                onClick={handleBack}
                className="px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl border border-white/30 text-white rounded-full transition-all font-medium hover:bg-white/10 active:scale-95 active:bg-white/20"
              >
                I need more time
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 