import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  promise: string;
}

const SUCCESS_MESSAGES = [
  "You kept your word to yourself. This builds trust within you. ✨",
  "Every promise kept strengthens your self-discipline. You're building something powerful. 🌟",
  "Being true to yourself today makes tomorrow's promises easier to keep. ⭐️",
  "This consistency is how you become someone you can always count on. 💫",
  "You're proving to yourself that your word has meaning. This is real growth. 🌱"
];

const ENCOURAGING_MESSAGES = [
  "Being honest with yourself is the first step to building real consistency. 🌿",
  "Every time you're truthful about your progress, you strengthen your commitment to growth. 🌅",
  "Tomorrow's promise will be easier to keep because you're honest with yourself today. ✨",
  "Your journey to consistency starts with being truthful about where you are. 🌱",
  "This honesty builds the foundation for lasting change. Keep being real with yourself. 🎯"
];

export function CompletionModal({ isOpen, onClose, onConfirm, promise }: CompletionModalProps) {
  const [stage, setStage] = useState<'initial' | 'confirm' | 'success' | 'encouragement'>('initial');
  const [message, setMessage] = useState('');
  const [canConfirm, setCanConfirm] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setStage('initial');
      setMessage('');
      setCanConfirm(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (stage === 'confirm') {
      // Start the delay timer
      setCanConfirm(false);
      const timer = setTimeout(() => {
        setCanConfirm(true);
      }, 3000); // 3 second delay

      return () => clearTimeout(timer);
    }
  }, [stage]);

  if (!isOpen) return null;

  const handleSuccess = () => {
    setStage('confirm');
  };

  const handleNotYet = () => {
    const randomMessage = ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)];
    setMessage(randomMessage);
    setStage('encouragement');
  };

  const handleContinue = () => {
    if (stage === 'confirm') {
      const randomMessage = SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)];
      setMessage(randomMessage);
      setStage('success');
    } else if (stage === 'success') {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
        onClick={stage === 'initial' ? onClose : undefined}
      />
      
      {/* Modal */}
      <div 
        className="relative bg-[#1a1a1a] rounded-2xl p-8 transform transition-all duration-300 scale-100 opacity-100 max-w-lg w-full mx-4"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {stage === 'initial' ? (
          <>
            <p className="text-xl text-center text-gray-400 mb-6">
              You promised yourself this:
              <br />
              <span className="text-white italic text-2xl mt-2 block">"{promise}"</span>
              <br />
              Did you keep your word?
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleNotYet}
                className="px-8 py-3 bg-red-400/10 text-red-200 hover:bg-red-400/20 transition-colors rounded-full"
              >
                No, not yet
              </button>
              <button
                onClick={handleSuccess}
                className="px-12 py-4 bg-emerald-400/20 text-emerald-200 text-xl rounded-full hover:bg-emerald-400/30 transition-all"
              >
                Yes, I did
              </button>
            </div>
          </>
        ) : stage === 'confirm' ? (
          <>
            <p className="text-xl text-center text-gray-400 mb-6">
              You promised yourself this:
              <br />
              <span className="text-white italic text-2xl mt-2 block">"{promise}"</span>
              <br />
              Did you keep your word?
            </p>
            <div className="flex flex-col items-center gap-6">
              <div className="text-emerald-400 text-2xl">✓</div>
              <p className="text-lg text-center text-gray-300">
                {canConfirm ? "Ready to confirm?" : "Take a moment to reflect..."}
              </p>
              <p className="text-sm text-center text-gray-500 max-w-sm">
                {canConfirm 
                  ? "Being honest with yourself builds the consistency you need for daily promises."
                  : "Lying to yourself only makes it harder to keep tomorrow's promise. Be truthful."
                }
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setStage('initial')}
                  className="px-8 py-4 text-lg rounded-full transition-all border border-gray-600 text-gray-400 hover:border-gray-500 hover:text-white"
                >
                  Undo
                </button>
                <button
                  onClick={handleContinue}
                  disabled={!canConfirm}
                  className={cn(
                    "px-12 py-4 text-xl rounded-full transition-all",
                    canConfirm
                      ? "bg-emerald-400/20 text-emerald-200 hover:bg-emerald-400/30"
                      : "bg-gray-600/20 text-gray-500 cursor-not-allowed"
                  )}
                >
                  {canConfirm ? "Confirm" : "Please wait..."}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-8 min-h-[200px] justify-center">
            {stage === 'success' && (
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-400/30 animate-ping" />
                <div className="absolute inset-0 rounded-full border-4 border-emerald-400/20" />
                <div className="absolute inset-0 flex items-center justify-center text-emerald-400 text-4xl animate-bounce">
                  ✓
                </div>
              </div>
            )}
            <p className={`text-2xl text-center animate-fade-in ${
              stage === 'success' ? 'text-emerald-200' : 'text-gray-400'
            }`}>
              {message}
            </p>
            <button
              onClick={handleContinue}
              className={`px-12 py-4 text-xl rounded-full transition-all ${
                stage === 'success'
                  ? 'bg-emerald-400/20 text-emerald-200 hover:bg-emerald-400/30'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 