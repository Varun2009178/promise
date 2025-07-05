"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { ClockModal } from '@/components/ui/clock-modal';
import { CompletionModal } from '@/components/ui/completion-modal';
import { AnalogClock } from '@/components/ui/analog-clock';
import { ModalBackdrop } from '@/components/ui/modal-backdrop';
import { SocialFeatures } from '@/components/ui/social-features';

function formatTimeLeft(timeLeft: number) {
  const hours = Math.floor(timeLeft / (60 * 60 * 1000));
  const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
  return { hours, minutes, seconds };
}

export default function Dashboard() {
  const params = useParams();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number>(24 * 60 * 60 * 1000);
  const [promise, setPromise] = useState<string>('');
  const [name, setName] = useState<string>("");
  const [completed, setCompleted] = useState(false);
  const [isAddingPromise, setIsAddingPromise] = useState(false);
  const [newPromise, setNewPromise] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmingFinal, setIsConfirmingFinal] = useState(false);
  const [isClockOpen, setIsClockOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [promiseData, setPromiseData] = useState<any>(null);
  const [promiseHistory, setPromiseHistory] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [reminderTime, setReminderTime] = useState<string>('morning');
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [tempReminderTime, setTempReminderTime] = useState<string>('morning');
  const [showShareCard, setShowShareCard] = useState(false);
  const [newPromiseStage, setNewPromiseStage] = useState<'input' | 'breathing' | 'reflection'>('input');
  const [breathCount, setBreathCount] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingTimeLeft, setBreathingTimeLeft] = useState(3);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mostRecentPromise, setMostRecentPromise] = useState<any>(null);

  const { hours, minutes, seconds } = formatTimeLeft(timeLeft);
  const progressPercent = ((24 * 60 * 60 * 1000 - timeLeft) / (24 * 60 * 60 * 1000)) * 100;

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Load user data and promise data in single API call
        const response = await fetch(`/api/user/${params.userId}`);
        const data = await response.json();
        
        if (!response.ok) {
          console.error('Failed to load user data:', data.error);
          router.push('/login');
          return;
        }

        setName(data.name);
        const reminderTimeValue = data.reminder_time || 'morning';
        setReminderTime(reminderTimeValue);
        setTempReminderTime(reminderTimeValue);

        // Always set the promise - if no current promise, use the most recent one
        if (data.current_promise) {
          setPromise(data.current_promise.promise_text);
          setPromiseData(data.current_promise);
          setCompleted(!!data.current_promise.completed);
          
          // Calculate time left if target_date exists
          if (data.current_promise.target_date) {
            const targetTime = new Date(data.current_promise.target_date).getTime();
            const now = Date.now();
            const timeLeft = Math.max(0, targetTime - now);
            setTimeLeft(timeLeft);
          }
        } else if (data.most_recent_promise) {
          // Fallback to most recent promise if no current promise
          setPromise(data.most_recent_promise.promise_text);
          setPromiseData(data.most_recent_promise);
          setCompleted(!!data.most_recent_promise.completed);
        }
        
        // Use most recent promise for 24-hour restriction
        if (data.most_recent_promise) {
          setMostRecentPromise(data.most_recent_promise);
        } else {
          setMostRecentPromise(null);
        }

        // Load promise history
        const historyResponse = await fetch(`/api/user/${params.userId}/history`);
        const historyData = await historyResponse.json();

        if (historyResponse.ok) {
          setPromiseHistory(historyData.promises || []);
        }

        // Trigger fade-in animation immediately
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading user data:', error);
        router.push('/login');
      }
    };

    loadUserData();

    // Update timer every second
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = Math.max(0, prevTime - 1000);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [params.userId, router]);

  // Breathing exercise logic
  useEffect(() => {
    if (newPromiseStage === 'breathing') {
      const timer = setInterval(() => {
        setBreathingTimeLeft(prev => {
          if (prev <= 1) {
            setBreathCount(prevCount => {
              if (prevCount >= 3) { // 3 complete breaths
                setNewPromiseStage('reflection');
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
  }, [newPromiseStage]);

  const startBreathing = () => {
    setIsBreathing(true);
    setNewPromiseStage('breathing');
    setBreathingTimeLeft(3);
    setBreathCount(0);
  };

  const resetNewPromiseFlow = () => {
    setIsAddingPromise(false);
    setNewPromise('');
    setNewPromiseStage('input');
    setBreathCount(0);
    setIsBreathing(false);
    setBreathingTimeLeft(3);
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

  const canWriteNewPromise = () => {
    if (!mostRecentPromise?.created_at) return true;
    
    const promiseTime = new Date(mostRecentPromise.created_at);
    const now = new Date();
    const timeDiff = now.getTime() - promiseTime.getTime();
    const hoursSinceCreation = timeDiff / (1000 * 60 * 60);
    
    // Must wait 24 hours from when the promise was created, regardless of completion
    return hoursSinceCreation >= 24;
  };

  const timeUntilNewPromise = () => {
    if (!mostRecentPromise?.created_at) return null;
    
    const promiseTime = new Date(mostRecentPromise.created_at);
    const targetTime = new Date(promiseTime.getTime() + (24 * 60 * 60 * 1000));
    const now = new Date();
    const timeLeft = targetTime.getTime() - now.getTime();
    
    if (timeLeft <= 0) return null;

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleWriteNewPromise = async () => {
    if (!newPromise.trim()) return;

    try {
      const response = await fetch(`/api/user/${params.userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promise_text: newPromise.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPromise(newPromise.trim());
        setPromiseData(data);
        setCompleted(false);
        setTimeLeft(24 * 60 * 60 * 1000);
        resetNewPromiseFlow();

        // Refresh promise history
        const historyResponse = await fetch(`/api/user/${params.userId}/history`);
        const historyData = await historyResponse.json();
        if (historyResponse.ok) {
          setPromiseHistory(historyData.promises || []);
        }
      } else {
        console.error('Failed to create promise');
      }
    } catch (error) {
      console.error('Error creating promise:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/${params.userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
      router.push('/');
      } else {
        console.error('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const handleSaveReminderTime = async () => {
    try {
      const response = await fetch(`/api/user/${params.userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reminder_time: tempReminderTime,
        }),
      });

      if (response.ok) {
        setReminderTime(tempReminderTime);
        setShowReminderSettings(false);
      } else {
        console.error('Failed to update reminder time');
      }
    } catch (error) {
      console.error('Error updating reminder time:', error);
    }
  };

  const handleCancelReminderSettings = () => {
    setTempReminderTime(reminderTime); // Reset to original value
    setShowReminderSettings(false);
  };

  const getTargetTime = () => {
    if (!promiseData?.created_at) return null;
    
    const createdTime = new Date(promiseData.created_at);
    const targetTime = new Date(createdTime.getTime() + 24 * 60 * 60 * 1000);
    
    return {
      time: targetTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      date: targetTime.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    };
  };

  const targetTimeInfo = getTargetTime();

  const handleComplete = async () => {
    if (!promiseData?.id) return;

    try {
      const response = await fetch(`/api/user/${params.userId}/notify-completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promise_id: promiseData.id,
        }),
      });

      if (response.ok) {
        setCompleted(true);
        setIsCompletionModalOpen(false);
        
        // Update the promise data to reflect completion
        setPromiseData((prev: any) => prev ? { ...prev, completed: true, completed_at: new Date().toISOString() } : null);
        
        // Refresh promise history
        async function fetchPromiseHistory() {
          const historyResponse = await fetch(`/api/user/${params.userId}/history`);
          const historyData = await historyResponse.json();
          if (historyResponse.ok) {
            setPromiseHistory(historyData.promises || []);
          }
        }
        fetchPromiseHistory();
      } else {
        console.error('Failed to mark promise as complete');
      }
    } catch (error) {
      console.error('Error completing promise:', error);
    }
  };

  const handleConfirmFinal = async () => {
    if (!promiseData?.id) return;

    try {
      const response = await fetch(`/api/user/${params.userId}/notify-completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promise_id: promiseData.id,
        }),
      });

      if (response.ok) {
        setCompleted(true);
        setIsConfirmingFinal(false);
        
        // Refresh promise history
        async function fetchPromiseHistory() {
          const historyResponse = await fetch(`/api/user/${params.userId}/history`);
          const historyData = await historyResponse.json();
          if (historyResponse.ok) {
            setPromiseHistory(historyData.promises || []);
          }
        }
        fetchPromiseHistory();
      } else {
        console.error('Failed to mark promise as complete');
      }
    } catch (error) {
      console.error('Error completing promise:', error);
    }
  };

  const notifyCompletion = async () => {
    if (!promiseData?.id) return;

    try {
      const response = await fetch(`/api/user/${params.userId}/notify-completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promise_id: promiseData.id,
        }),
      });

      if (response.ok) {
        setCompleted(true);
        
        // Refresh promise history
        async function fetchPromiseHistory() {
          const historyResponse = await fetch(`/api/user/${params.userId}/history`);
          const historyData = await historyResponse.json();
          if (historyResponse.ok) {
            setPromiseHistory(historyData.promises || []);
          }
        }
        fetchPromiseHistory();
      } else {
        console.error('Failed to mark promise as complete');
      }
    } catch (error) {
      console.error('Error completing promise:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      {/* Modals */}
      <ClockModal
        isOpen={isClockOpen}
        onClose={() => setIsClockOpen(false)}
      >
        <AnalogClock size={300} targetTime={targetTimeInfo?.time} />
      </ClockModal>

      <CompletionModal
        isOpen={isCompletionModalOpen}
        onClose={() => setIsCompletionModalOpen(false)}
        onConfirm={handleComplete}
        promise={promise}
      />

      {/* Clean Header */}
      <header className={cn(
        "px-6 py-4 transition-all duration-700",
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      )}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="/Promise. (1).png" 
              alt="Promise" 
              className="h-8 w-auto"
            />
            <div className="text-sm text-gray-400">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReminderSettings(!showReminderSettings)}
              className="text-gray-400 hover:text-white transition-colors text-sm px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              Reminders
            </button>
            <button
              onClick={() => {
                router.push('/');
                setTimeout(() => {
                  window.location.reload();
                }, 100);
              }}
              className="text-gray-400 hover:text-white transition-colors text-sm px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              Log Out
            </button>
        <button
          onClick={handleDeleteAccount}
              className="text-gray-400 hover:text-red-400 transition-colors text-sm px-3 py-1.5 rounded-lg hover:bg-white/5"
        >
              Delete
        </button>
      </div>
        </div>
      </header>

      {/* Main Content */}
              <main className="px-6 py-8 pb-20">
        {isAddingPromise ? (
          // New Promise Flow - Keep existing design
          <div className={cn(
            "max-w-full sm:max-w-2xl mx-auto transition-all duration-300 delay-100",
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            {newPromiseStage === 'input' && (
              <>
                <div className="mb-8 sm:mb-12">
                  <h2 className="text-2xl sm:text-3xl text-white font-light mb-4">
                    New Promise
                  </h2>
                  <p className="text-gray-400 text-sm sm:text-base">What will you commit to today?</p>
                </div>
                
                {/* Sample tasks */}
                <div className="mb-6 sm:mb-8">
                  <p className="text-gray-400 text-sm mb-4">Quick ideas:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      "Read 30 minutes",
                      "Exercise 20 min", 
                      "Learn something new",
                      "Call a friend",
                      "Practice gratitude",
                      "Try new recipe",
                      "Write in journal",
                      "Take a walk"
                    ].map((task, index) => (
                      <button
                        key={index}
                        onClick={() => setNewPromise(task)}
                        className="p-3 text-left text-sm bg-white/5 text-gray-300 hover:bg-white/10 
                                 transition-all rounded-lg border border-white/10"
                      >
                        {task}
                      </button>
                    ))}
                  </div>
                </div>
                
            <textarea
              ref={textareaRef}
              value={newPromise}
              onChange={(e) => setNewPromise(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && newPromise.length >= 3) {
                  e.preventDefault();
                      startBreathing();
                }
              }}
                  placeholder="Or write your own promise..."
                  className="w-full p-4 text-base sm:text-lg bg-white/5 border border-white/10 rounded-lg
                            text-white focus:outline-none focus:border-white/20 transition-colors
                            placeholder-gray-600 resize-none leading-relaxed"
              style={{
                    minHeight: '120px',
                    lineHeight: '1.6'
              }}
              autoFocus
            />
                
                <div className="flex justify-between items-center mt-4 mb-6">
                  <div className="text-gray-400 text-sm">
                    {newPromise.length}/200 characters
                  </div>
                  <div className="text-gray-400 text-sm">
                    Press Enter to continue
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                    onClick={resetNewPromiseFlow}
                    className="px-6 py-3 text-gray-400 hover:text-white transition-colors order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                    onClick={startBreathing}
                disabled={newPromise.length < 3}
                className={cn(
                      "px-8 py-3 bg-white text-black rounded-lg transition-all font-medium order-1 sm:order-2",
                      newPromise.length < 3 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
                )}
              >
                    Continue
              </button>
            </div>
              </>
            )}

            {newPromiseStage === 'breathing' && (
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
                        strokeDashoffset={`${2 * Math.PI * 60 * (1 - breathingTimeLeft / 3)}`}
                        className="transition-all duration-1000 ease-linear"
                />
              </svg>
                  </div>
                  
                  {/* Time Display */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl text-white font-light">{breathingTimeLeft}</span>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm sm:text-base">
                  Breath {Math.floor(breathCount / 4) + 1} of 3
                </p>
              </div>
            )}

            {newPromiseStage === 'reflection' && (
              <div className="animate-fade-in">
                <h2 className="text-2xl sm:text-3xl text-white font-light mb-8 sm:mb-12">
                  How does this feel?
                </h2>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 mb-8">
                  <p className="text-lg sm:text-xl text-white font-light leading-relaxed mb-6">
                    "{newPromise}"
                  </p>
                  <p className="text-gray-400 text-sm sm:text-base">
                    This commitment is for you, and only you
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleWriteNewPromise}
                    className="px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl bg-white text-black rounded-full transition-all font-medium hover:bg-gray-100 active:scale-95 active:bg-gray-200"
                  >
                    I'm ready to commit
                  </button>
                  <button
                    onClick={resetNewPromiseFlow}
                    className="px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl border border-white/30 text-white rounded-full transition-all font-medium hover:bg-white/10 active:scale-95 active:bg-white/20"
                  >
                    I need more time
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Main Dashboard - Redesigned
          <div className={cn(
            "max-w-4xl mx-auto transition-all duration-300 delay-100",
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            
            {/* User Welcome Section */}
            <div className={cn(
              "text-center mb-12 transition-all duration-300 delay-150",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              <h1 className="text-2xl sm:text-3xl text-white font-light">
                Hello, {name}
              </h1>
            </div>

            {/* Main Promise Card */}
            <div className={cn(
              "bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 transition-all duration-300 delay-200",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              
              {promise ? (
                <>
                  {/* Status Badge */}
                  <div className="flex justify-center mb-6">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                      completed 
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                        : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    )}>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        completed ? "bg-emerald-400" : "bg-blue-400"
                      )} />
                      {completed ? 'Completed' : 'In Progress'}
                    </div>
                  </div>

                  {/* Promise Text */}
                  <div className="text-center mb-8">
                    <h2 className="text-xl sm:text-2xl text-white font-light leading-relaxed max-w-2xl mx-auto">
                      "{promise}"
                    </h2>
                  </div>

                  {/* Clock */}
                  <div className="flex flex-col items-center mb-8">
                    <AnalogClock size={100} targetTime={targetTimeInfo?.time} />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => setIsCompletionModalOpen(true)}
                      disabled={completed}
                      className={cn(
                        "px-8 py-4 rounded-xl transition-all font-medium text-base",
                        completed
                          ? "bg-emerald-500/20 text-emerald-300 cursor-not-allowed"
                          : "bg-white text-black hover:bg-gray-100 active:scale-95"
                      )}
                    >
                      {completed ? "✓ Completed" : "Mark Complete"}
                    </button>
                    
                    <div className="relative group">
                    <button
                        onClick={() => setIsAddingPromise(true)}
                        disabled={!canWriteNewPromise()}
                        className={cn(
                          "px-8 py-4 rounded-xl transition-all border text-base",
                          canWriteNewPromise()
                            ? "border-white/30 text-white hover:bg-white/10 active:scale-95"
                            : "border-gray-700 text-gray-500 cursor-not-allowed"
                        )}
                      >
                        New Promise
                    </button>
                      
                      {!canWriteNewPromise() && timeUntilNewPromise() && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                                      bg-black/90 text-white text-xs rounded-lg px-3 py-2
                                      opacity-0 group-hover:opacity-100 transition-opacity
                                      whitespace-nowrap pointer-events-none z-20">
                          Available in {timeUntilNewPromise()}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 
                                        border-4 border-transparent border-t-black/90"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Social Features */}
                  <div className="border-t border-white/10 pt-6 mt-8">
                    <SocialFeatures 
                      promise={promise}
                      userId={params.userId as string}
                      isCompleted={completed}
                    />
                  </div>
                </>
              ) : (
                // Empty State
                <div className="text-center py-12">
                  <div className="text-6xl mb-6">🌱</div>
                  <h2 className="text-xl sm:text-2xl text-white font-light mb-4">
                    Ready to make a promise?
                  </h2>
                  <p className="text-gray-400 text-base mb-8 max-w-md mx-auto">
                    Start your journey of intentional living with one meaningful commitment today.
                  </p>
                  
                  <div className="relative group">
                <button
                      onClick={() => setIsAddingPromise(true)}
                      disabled={!canWriteNewPromise()}
                      className={cn(
                        "px-8 py-4 rounded-xl transition-all font-medium text-base",
                        canWriteNewPromise()
                          ? "bg-white text-black hover:bg-gray-100 active:scale-95"
                          : "bg-gray-700 text-gray-500 cursor-not-allowed"
                      )}
                    >
                      Create Your First Promise
                </button>
                    
                    {!canWriteNewPromise() && timeUntilNewPromise() && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                                    bg-black/90 text-white text-xs rounded-lg px-3 py-2
                                    opacity-0 group-hover:opacity-100 transition-opacity
                                    whitespace-nowrap pointer-events-none z-20">
                        Available in {timeUntilNewPromise()}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 
                                      border-4 border-transparent border-t-black/90"></div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Journey Section */}
            {promiseHistory.length > 0 && (
              <div className={cn(
                "transition-all duration-300 delay-300",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-lg text-white font-light">
                    Your Journey
                  </h2>
                  <div className="flex-1 h-px bg-white/10"></div>
                  <span className="text-sm text-gray-500">
                    {promiseHistory.length} promise{promiseHistory.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {promiseHistory.map((promise, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "p-6 rounded-xl border",
                        promise.completed 
                          ? "bg-emerald-500/10 border-emerald-500/20" 
                          : "bg-gray-800/50 border-gray-700/50"
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            promise.completed ? "bg-emerald-400" : "bg-gray-600"
                          )} />
                          <span className="text-xs text-gray-400">
                            {new Date(promise.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        {promise.completed && (
                          <span className="text-emerald-400 text-sm">✓</span>
                        )}
                      </div>
                      <p className={cn(
                        "text-sm leading-relaxed",
                        promise.completed ? "text-white" : "text-gray-400"
                      )}>
                        {promise.promise_text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Reminder Settings Modal */}
      <ModalBackdrop isOpen={showReminderSettings} onClose={() => setShowReminderSettings(false)}>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
          <h3 className="text-white font-medium text-lg mb-4">Reminder Settings</h3>
          
          <p className="text-gray-400 text-sm mb-4">When would you like to receive daily reminders?</p>
          
          <div className="space-y-2 mb-6">
            {[
              { value: 'morning', label: 'Morning', description: 'Start your day with focus' },
              { value: 'midday', label: 'Midday', description: 'Check in during lunch' },
              { value: 'evening', label: 'Evening', description: 'Reflect before bed' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTempReminderTime(option.value)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg border transition-all",
                  tempReminderTime === option.value 
                    ? "bg-white text-black border-white" 
                    : "text-gray-300 border-gray-600 hover:border-gray-500 hover:text-white"
                )}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-sm opacity-70">{option.description}</div>
              </button>
            ))}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleCancelReminderSettings}
              className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveReminderTime}
              className="flex-1 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </ModalBackdrop>

      {/* Share Card Modal */}
      <ModalBackdrop isOpen={showShareCard} onClose={() => setShowShareCard(false)}>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
          <h3 className="text-white font-medium text-lg mb-4">Share Your Promise</h3>
          
          {/* Shareable Card Preview */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 mb-6 text-center">
            <div className="text-white">
              <div className="text-2xl mb-4">✨</div>
              <div className="text-lg font-medium mb-2">I promised to:</div>
              <div className="text-xl font-light mb-4 italic">
                "{promise}"
              </div>
              <div className="text-sm opacity-90">🌱 via promise.app</div>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm mb-6 text-center">
            Share this beautiful card on TikTok, Instagram, or anywhere you'd like to inspire others!
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowShareCard(false)}
              className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                // TODO: Implement actual sharing functionality
                // For now, just copy to clipboard
                navigator.clipboard.writeText(`✨ I promised to:\n"${promise}"\n🌱 via promise.app`);
                alert('Card text copied to clipboard! You can now paste it anywhere.');
                setShowShareCard(false);
              }}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              Copy & Share
            </button>
          </div>
      </div>
      </ModalBackdrop>
    </div>
  );
} 