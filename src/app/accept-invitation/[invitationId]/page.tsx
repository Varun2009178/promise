"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";

interface Invitation {
  id: string;
  user_id: string;
  partner_email: string;
  promise_text: string;
  status: string;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
}

export default function AcceptInvitation() {
  const params = useParams();
  const router = useRouter();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await fetch(`/api/invitation/${params.invitationId}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Invitation not found');
          return;
        }

        setInvitation(data.invitation);
      } catch (error) {
        setError('Failed to load invitation');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [params.invitationId]);

  const handleAccept = async () => {
    setProcessing(true);
    try {
      const response = await fetch(`/api/invitation/${params.invitationId}/accept`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to accept invitation');
      }

      // Redirect to home page with success message
      router.push('/?message=invitation-accepted');
    } catch (error) {
      setError('Failed to accept invitation');
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    setProcessing(true);
    try {
      const response = await fetch(`/api/invitation/${params.invitationId}/decline`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to decline invitation');
      }

      // Redirect to home page
      router.push('/?message=invitation-declined');
    } catch (error) {
      setError('Failed to decline invitation');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">🌱</div>
          <div className="text-lg">Loading invitation...</div>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-2xl font-light mb-4">Invitation Not Found</h1>
          <p className="text-gray-400 mb-6">
            This invitation may have expired or been removed.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (invitation.status !== 'pending') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-4xl mb-4">
            {invitation.status === 'accepted' ? '✅' : '❌'}
          </div>
          <h1 className="text-2xl font-light mb-4">
            Invitation Already {invitation.status === 'accepted' ? 'Accepted' : 'Declined'}
          </h1>
          <p className="text-gray-400 mb-6">
            This invitation has already been {invitation.status}.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🌱</div>
          <h1 className="text-3xl font-light mb-2">Promise</h1>
          <p className="text-gray-400">Accountability Partner Invitation</p>
        </div>

        {/* Invitation Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-medium mb-2">
              {invitation.user.name} wants you to be their accountability partner
            </h2>
            <p className="text-gray-400 text-sm">
              {invitation.user.email}
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <p className="text-gray-300 text-sm mb-2">Their promise:</p>
            <p className="text-white text-lg font-light italic">
              "{invitation.promise_text}"
            </p>
          </div>

          <div className="text-gray-400 text-sm text-center">
            <p>As their accountability partner, you'll receive notifications when they complete their promise.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleAccept}
            disabled={processing}
            className={cn(
              "w-full px-6 py-4 bg-green-500 text-white rounded-lg font-medium transition-all",
              processing ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600 active:scale-95"
            )}
          >
            {processing ? 'Accepting...' : 'Accept Invitation'}
          </button>
          
          <button
            onClick={handleDecline}
            disabled={processing}
            className={cn(
              "w-full px-6 py-4 border border-gray-600 text-gray-300 rounded-lg font-medium transition-all",
              processing ? "opacity-50 cursor-not-allowed" : "hover:border-gray-500 hover:text-white active:scale-95"
            )}
          >
            {processing ? 'Declining...' : 'Decline'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 