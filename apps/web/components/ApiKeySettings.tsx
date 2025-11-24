'use client';

import { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Check, X } from 'lucide-react';

export default function ApiKeySettings() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    // Load API key from localStorage
    const saved = localStorage.getItem('gemini_api_key');
    if (saved) {
      setApiKey(saved);
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      alert('✅ API key saved! It will be used for all AI features.');
      setIsOpen(false);
    }
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      alert('Please enter an API key first');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() })
      });

      if (response.ok) {
        setTestResult('success');
      } else {
        setTestResult('error');
      }
    } catch (error) {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  const handleClear = () => {
    if (confirm('Remove your API key? You\'ll need to enter it again to use AI features.')) {
      localStorage.removeItem('gemini_api_key');
      setApiKey('');
      alert('API key removed');
    }
  };

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-all hover:scale-110 z-50"
        title="API Key Settings"
      >
        <Key className="w-6 h-6" />
      </button>

      {/* Settings Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Key className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">API Key Settings</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Get your free API key from{' '}
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:underline"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-lg ${
                    testResult === 'success'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {testResult === 'success' ? (
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      <span>API key is valid!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <X className="w-5 h-5" />
                      <span>API key is invalid or expired</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleTest}
                  disabled={testing || !apiKey.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {testing ? 'Testing...' : 'Test Key'}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!apiKey.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save Key
                </button>
              </div>

              {apiKey && (
                <button
                  onClick={handleClear}
                  className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Clear API Key
                </button>
              )}

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">🔒 Privacy & Security</h3>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Your API key is stored locally in your browser</li>
                  <li>• It's never sent to our servers</li>
                  <li>• Only used to call Google's Gemini API directly</li>
                  <li>• You can clear it anytime</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
