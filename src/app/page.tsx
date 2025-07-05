"use client";

import { metadata } from './metadata';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

metadata;

const EXAMPLE_PROMISES = [
  "write one page",
  "learn one concept",
  "read ten pages",
  "practice for 30 minutes",
  "solve one problem",
  "take one small step",
  "build one thing",
  "start something new",
  "plant one seed",
  "water one idea",
  "grow one skill",
  "nurture one habit",
];

export default function Home() {
  const router = useRouter();
  const [stage, setStage] = useState<'promise' | 'intention' | 'typing'>('promise');
  const [promise, setPromise] = useState('');
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [itemHeight, setItemHeight] = useState(80); // Default height

  // Calculate item height based on viewport size
  useEffect(() => {
    const updateItemHeight = () => {
      const width = window.innerWidth;
      if (width <= 640) {
        setItemHeight(80);
      } else if (width <= 768) {
        setItemHeight(80);
      } else if (width <= 1024) {
        setItemHeight(120);
      } else {
        setItemHeight(140);
      }
    };

    updateItemHeight();
    window.addEventListener('resize', updateItemHeight);
    return () => window.removeEventListener('resize', updateItemHeight);
  }, []);

  useEffect(() => {
    // Move to intention stage after 0.5 seconds
    const intentionStageTimer = setTimeout(() => {
      setStage('intention');
    }, 500);

    // Move to typing stage after 2 seconds
    const typingStageTimer = setTimeout(() => {
      setStage('typing');
    }, 2000);

    return () => {
      clearTimeout(intentionStageTimer);
      clearTimeout(typingStageTimer);
    };
  }, []);

  // Focus input when we enter typing stage
  useEffect(() => {
    if (stage === 'typing') {
      const focusInput = () => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      };

      // Focus after a short delay
      const focusTimer = setTimeout(focusInput, 500);

      // Add click listener to document
      document.addEventListener('click', focusInput);

      return () => {
        clearTimeout(focusTimer);
        document.removeEventListener('click', focusInput);
      };
    }
  }, [stage]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        if (stage === 'typing' && !promise) {
          startScrolling();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [stage, promise]);

  const startScrolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setCurrentExampleIndex((prev) => {
        const nextIndex = prev + 1;
        // Truly infinite - just keep going
        return nextIndex;
      });
    }, 2500);
  };

  // Start/stop scrolling based on stage and promise
  useEffect(() => {
    if (stage === 'typing' && !promise && !document.hidden) {
      startScrolling();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [stage, promise]);

  // Handle smooth scrolling animation
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.transition = 'transform 0.7s ease-in-out';
      scrollContainerRef.current.style.transform = `translateY(-${currentExampleIndex * itemHeight}px)`;
    }
  }, [currentExampleIndex, itemHeight]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promise.length >= 3) {
        router.push(`/confirm?promise=${encodeURIComponent(promise)}`);
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
      
      {/* Subtle nature elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-20 w-1 h-1 bg-green-300 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-10 right-10 w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>

      {/* Login button */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6">
        <button
          onClick={() => router.push('/login')}
          className="px-4 sm:px-6 py-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          Login
        </button>
      </div>

      {/* Promise Stage */}
      <div 
        className={cn(
          "absolute transition-all duration-1000 w-full text-center",
          stage === 'promise' 
            ? "transform-none opacity-100" 
            : "-translate-y-[140px] opacity-0"
        )}
        style={{ top: '45%', transform: 'translateY(-50%)' }}
      >
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light text-white leading-tight">
          Promise
        </h1>
      </div>

      {/* "Every day deserves your intention" Stage */}
      <div 
        className={cn(
          "absolute transition-all duration-1000 w-full text-center px-4",
          stage === 'promise'
            ? "translate-y-[140px] opacity-0"
            : stage === 'intention'
              ? "transform-none opacity-100"
              : "-translate-y-[140px] opacity-0"
        )}
        style={{ top: '45%', transform: 'translateY(-50%)' }}
      >
        <p className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gray-300 leading-normal">
          every day deserves your <span className="text-green-600">intention</span>
        </p>
      </div>

      {/* Typing section */}
      <div 
        className={cn(
          "absolute w-full max-w-3xl transition-all duration-1000 px-4",
          stage === 'intention'
            ? "translate-y-[140px] opacity-0"
            : stage === 'typing'
              ? "transform-none opacity-100"
                  : "translate-y-[140px] opacity-0"
        )}
      >
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-8 sm:gap-12">
          {/* Question */}
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-400 leading-normal text-center">
            what is one thing you <span className="font-semibold text-white">need</span> to do by tomorrow?
          </p>

          <div className="relative w-full">
            {/* Input field */}
            <div 
              className="relative"
              style={{
                height: `${itemHeight}px`,
              }}
            >
              <textarea
                ref={textareaRef}
                value={promise}
                onChange={(e) => {
                  const text = e.target.value;
                  // Limit to 200 characters
                  if (text.length <= 200) {
                    setPromise(text);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (promise.length >= 3) {
                        router.push(`/confirm?promise=${encodeURIComponent(promise)}`);
                    }
                  }
                }}
                rows={2}
                maxLength={200}
                className="absolute inset-0 w-full text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light bg-transparent border-none 
                          text-center focus-visible:ring-0 focus-visible:ring-offset-0 resize-none
                          overflow-y-auto whitespace-pre-wrap text-white px-4 caret-transparent"
                style={{
                  outline: 'none',
                  lineHeight: '1.2',
                  height: `${itemHeight}px`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  paddingTop: '19px',
                  justifyContent: 'center',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                  hyphens: 'auto',
                  paddingBottom: '30px'
                }}
              />
            </div>

            {/* Character counter */}
            {promise.length > 0 && (
              <div className="absolute bottom-2 right-4 text-xs text-gray-500">
                {promise.length}/200
              </div>
            )}

            {/* Example promises - Truly infinite vertical carousel */}
            <div 
              className={cn(
                "absolute inset-0",
                !promise ? "opacity-100" : "opacity-0"
              )}
              onClick={() => textareaRef.current?.focus()}
            >
              <div 
                className="relative overflow-hidden carousel-container"
                style={{
                  height: `${itemHeight}px`,
                }}
              >
                {/* Background mask */}
                <div className="absolute inset-0 bg-[#1a1a1a]" />
                
                {/* Scrolling container */}
                <div className="absolute inset-0 overflow-hidden">
                    <div
                    ref={scrollContainerRef}
                    className="absolute w-full"
                      style={{
                        willChange: 'transform',
                      }}
                    >
                    {/* Generate enough items for truly infinite scroll */}
                    {Array.from({ length: 100 }, (_, i) => (
                        <div 
                          key={i} 
                        className="absolute w-full text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light flex items-center justify-center text-gray-500 px-4 carousel-item"
                          style={{
                          top: `${i * itemHeight}px`,
                          height: `${itemHeight}px`,
                          lineHeight: '1.2',
                            whiteSpace: 'pre-line',
                            transform: 'translateZ(0)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          textAlign: 'center',
                          wordBreak: 'break-word',
                          hyphens: 'auto'
                          }}
                        >
                        {EXAMPLE_PROMISES[i % EXAMPLE_PROMISES.length]}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={promise.length < 3}
            className={cn(
              "px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl bg-white text-black rounded-full transition-all duration-500 font-medium",
              promise.length < 3 
                ? "opacity-0 translate-y-4 pointer-events-none" 
                : "opacity-100 transform-none hover:bg-gray-100"
            )}
          >
            Promise
          </button>
        </form>
      </div>
    </div>
  );
}
