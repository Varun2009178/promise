"use client";

import { useState } from 'react';
import { cn } from "@/lib/utils";

interface SocialFeaturesProps {
  promise: string;
  userId: string;
  isCompleted: boolean;
  onShare?: () => void;
}

export function SocialFeatures({ promise, userId, isCompleted, onShare }: SocialFeaturesProps) {
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [shareText, setShareText] = useState(`I promised to: "${promise}"\n\nvia promise.app`);

  const handleShare = async (platform: string) => {
    const text = shareText;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&title=${encodeURIComponent('My Promise')}&summary=${encodeURIComponent(text)}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(text)}`);
        break;
      case 'copy':
        await navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
        break;
      default:
        break;
    }
  };

  return (
    <>
      {/* Social Button */}
      <button
        onClick={() => setShowSocialModal(true)}
        className="text-gray-400 hover:text-white transition-colors text-sm flex items-center justify-center gap-2 mx-auto"
      >
        <span>Share</span>
      </button>

      {/* Social Modal */}
      {showSocialModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-black border border-white/10 rounded-xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-light text-lg">Share Your Promise</h3>
                <button
                  onClick={() => setShowSocialModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Share Widget */}
            <div className="p-4 space-y-6">
              {/* Shareable Card Preview */}
              <div className="relative">
                <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 text-center backdrop-blur-sm">
                  <div className="absolute top-3 right-3 text-xs text-gray-400 font-light">
                    promise.app
                  </div>
                  
                  {/* Logo */}
                  <div className="flex justify-center mb-4">
                    <img 
                      src="/promise.png" 
                      alt="Promise" 
                      className="h-8 w-auto filter brightness-0 invert"
                    />
                  </div>
                  
                  <div className="text-white mb-4">
                    <div className="text-sm font-light text-gray-300 mb-2">I promised to</div>
                    <div className="text-lg font-light italic leading-relaxed">
                      "{promise}"
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span>Daily commitment</span>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Share Text */}
              <div>
                <label className="block text-gray-300 text-sm mb-2 font-light">Share Text</label>
                <textarea
                  value={shareText}
                  onChange={(e) => setShareText(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm resize-none font-light"
                  rows={3}
                />
              </div>

              {/* Share Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleShare('twitter')}
                  className="p-3 bg-white/5 border border-white/10 text-white rounded-lg text-sm font-light hover:bg-white/10 transition-all duration-200 hover:border-white/20"
                >
                  Twitter
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="p-3 bg-white/5 border border-white/10 text-white rounded-lg text-sm font-light hover:bg-white/10 transition-all duration-200 hover:border-white/20"
                >
                  LinkedIn
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="p-3 bg-white/5 border border-white/10 text-white rounded-lg text-sm font-light hover:bg-white/10 transition-all duration-200 hover:border-white/20"
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => handleShare('telegram')}
                  className="p-3 bg-white/5 border border-white/10 text-white rounded-lg text-sm font-light hover:bg-white/10 transition-all duration-200 hover:border-white/20"
                >
                  Telegram
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="p-3 bg-white text-black rounded-lg text-sm font-light hover:bg-gray-100 transition-all duration-200 col-span-2"
                >
                  Copy to Clipboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 