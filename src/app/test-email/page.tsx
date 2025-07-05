'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState } from 'react';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [type, setType] = useState<'gentle' | 'completion'>('gentle');
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const sendTestEmail = async () => {
    if (!email) {
      setResult('Please enter an email address');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          type,
          isCompleted
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`✅ ${data.message}`);
      } else {
        setResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Failed to send email: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-light mb-8">Test Email System</h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-white"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'gentle' | 'completion')}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-white"
            >
              <option value="gentle">Gentle Reminder</option>
              <option value="completion">Completion Reminder</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="completed"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="completed" className="text-sm">
              Mark as completed (for completion reminder)
            </label>
          </div>

          <button
            onClick={sendTestEmail}
            disabled={loading}
            className="w-full bg-white text-black py-3 px-6 rounded-full font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Test Email'}
          </button>

          {result && (
            <div className={`p-4 rounded-lg ${
              result.includes('✅') ? 'bg-green-900/20 border border-green-700' : 'bg-red-900/20 border border-red-700'
            }`}>
              {result}
            </div>
          )}
        </div>

        <div className="mt-8 text-sm text-gray-400">
          <h3 className="font-medium mb-2">Email Types:</h3>
          <ul className="space-y-1">
            <li><strong>Gentle Reminder:</strong> Sent at user's selected reminder time, uses seed metaphor</li>
            <li><strong>Completion Reminder:</strong> Sent 24 hours after promise creation, celebrates completion or encourages finishing</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 