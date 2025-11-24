'use client';

import { useState } from 'react';
import { Skull, Code, TestTube, BookOpen, CheckCircle } from 'lucide-react';

interface AIAssistantProps {
  code: string;
  language: string;
  filePath?: string;
  onFixApplied?: (fixedCode: string) => void;
  onAutoReapClick?: () => void;
}

export default function AIAssistant({ code, language, filePath, onFixApplied, onAutoReapClick }: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState<'fix' | 'explain' | 'test' | 'review'>('fix');
  const [bugDescription, setBugDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoApply, setAutoApply] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAnalyzeAndFix = async () => {
    // Get API key (optional for demo mode)
    const apiKey = localStorage.getItem('gemini_api_key') || '';

    setLoading(true);
    setError(null);
    
    try {
      // If no description provided, use auto-detect mode
      const description = bugDescription.trim() || 'Analyze this code and find any bugs, issues, or improvements needed. Fix them automatically.';
      
      const response = await fetch('/api/fix', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({ code, bugDescription: description, filePath, language })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI analysis failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    const apiKey = localStorage.getItem('gemini_api_key') || '';

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/fix', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({ code, language })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI explanation failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTests = async () => {
    const apiKey = localStorage.getItem('gemini_api_key') || '';

    if (!bugDescription.trim()) {
      setError('Please describe what to test');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/fix', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({ code, language, bugDescription })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Test generation failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    const apiKey = localStorage.getItem('gemini_api_key') || '';

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/fix', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({ code, language })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Code review failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFix = async () => {
    if (!result?.fixed) return;
    
    // Update editor
    if (onFixApplied) {
      onFixApplied(result.fixed);
    }
    
    // If auto-apply is enabled and we have a file path, save to file
    if (autoApply && filePath) {
      await saveToFile(result.fixed);
    }
    
    setResult(null);
    setBugDescription('');
  };

  const saveToFile = async (content: string) => {
    console.log('[Save to File] Starting save...');
    console.log('[Save to File] File path:', filePath);
    console.log('[Save to File] Content length:', content?.length);
    
    if (!filePath) {
      alert('No file path available');
      return;
    }
    
    setSaving(true);
    try {
      console.log('[Save to File] Sending request to API...');
      const response = await fetch('/api/write-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, content })
      });
      
      console.log('[Save to File] Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Save to File] Error response:', errorData);
        throw new Error(errorData.error || 'Failed to save file');
      }
      
      const result = await response.json();
      console.log('[Save to File] Success:', result);
      alert('✅ File saved successfully!\n\nFile: ' + filePath + '\nBackup created: ' + (result.backupCreated ? 'Yes' : 'No'));
    } catch (error) {
      console.error('[Save to File] Failed:', error);
      alert('❌ Failed to save file: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(50, 50, 50, 0.6)',
      border: '1px solid rgba(200, 200, 200, 0.2)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      padding: '24px'
    }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#d4d4d4',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            fontFamily: 'Georgia, serif',
            letterSpacing: '1px'
          }}>
            Dark AI Oracle
          </h2>
        </div>
        
        {/* Auto-Apply Toggle */}
        {filePath && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Auto-apply to file</label>
            <button
              onClick={() => setAutoApply(!autoApply)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoApply ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoApply ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4" style={{ borderBottom: '2px solid #A52A2A' }}>
        <button
          onClick={() => { setActiveTab('fix'); setResult(null); setError(null); }}
          style={{
            padding: '8px 16px',
            fontWeight: 500,
            color: activeTab === 'fix' ? '#A52A2A' : '#888',
            borderBottom: activeTab === 'fix' ? '2px solid #A52A2A' : 'none',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Reap Bug
        </button>
        <button
          onClick={() => { setActiveTab('explain'); setResult(null); setError(null); }}
          style={{
            padding: '8px 16px',
            fontWeight: 500,
            color: activeTab === 'explain' ? '#A52A2A' : '#888',
            borderBottom: activeTab === 'explain' ? '2px solid #A52A2A' : 'none',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Decipher
        </button>
        <button
          onClick={() => { setActiveTab('test'); setResult(null); setError(null); }}
          style={{
            padding: '8px 16px',
            fontWeight: 500,
            color: activeTab === 'test' ? '#A52A2A' : '#888',
            borderBottom: activeTab === 'test' ? '2px solid #A52A2A' : 'none',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Summon Tests
        </button>
        <button
          onClick={() => { setActiveTab('review'); setResult(null); setError(null); }}
          style={{
            padding: '8px 16px',
            fontWeight: 500,
            color: activeTab === 'review' ? '#A52A2A' : '#888',
            borderBottom: activeTab === 'review' ? '2px solid #A52A2A' : 'none',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Haunt Code
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {(activeTab === 'fix' || activeTab === 'test') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {activeTab === 'fix' 
                ? 'Describe the bug (optional - leave empty for AI to auto-detect):' 
                : 'What should the tests cover?'}
            </label>
            <textarea
              value={bugDescription}
              onChange={(e) => setBugDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              style={{ color: '#111827' }}
              rows={3}
              placeholder={activeTab === 'fix' 
                ? "Leave empty to let AI find and fix issues automatically, or describe a specific bug" 
                : "e.g., Test form submission with valid and invalid data"}
            />
          </div>
        )}

        <button
          onClick={() => {
            if (onAutoReapClick) {
              console.log('🎬 Auto Reap button clicked - triggering video');
              onAutoReapClick();
            }
            if (activeTab === 'fix') handleAnalyzeAndFix();
            else if (activeTab === 'explain') handleExplain();
            else if (activeTab === 'test') handleGenerateTests();
            else if (activeTab === 'review') handleReview();
          }}
          disabled={loading}
          className="spooky-button"
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #A52A2A 0%, #A52A2A 100%)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: 600,
            border: '2px solid #A52A2A',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
            textShadow: '0 0 10px #000',
            fontFamily: '"Nosifer", cursive',
            fontSize: '18px',
            letterSpacing: '2px'
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Summoning dark magic...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {activeTab === 'fix' && (bugDescription.trim() ? 'Reap Bug' : 'Auto-Reap')}
              {activeTab === 'explain' && 'Decipher Code'}
              {activeTab === 'test' && 'Generate Tests'}
              {activeTab === 'review' && 'Review Code'}
            </span>
          )}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
            {activeTab === 'fix' && (
              <>
                <div>
                  <h3 className="font-semibold text-purple-900 mb-2">Explanation:</h3>
                  <p className="text-gray-700">{result.explanation}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900 mb-2">Confidence:</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                        style={{ width: `${result.confidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-purple-900">{result.confidence}%</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900 mb-2">Fixed Code:</h3>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                    {result.fixed}
                  </pre>
                </div>
                <button
                  onClick={applyFix}
                  disabled={saving}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : autoApply && filePath ? 'Apply & Save to File' : 'Apply This Fix'}
                </button>
              </>
            )}

            {activeTab === 'explain' && (
              <div>
                <h3 className="font-semibold text-purple-900 mb-2">Explanation:</h3>
                <div className="text-gray-700 whitespace-pre-wrap">{result.explanation}</div>
              </div>
            )}

            {activeTab === 'test' && (
              <div>
                <h3 className="font-semibold text-purple-900 mb-2">Generated Tests:</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  {result.tests}
                </pre>
              </div>
            )}

            {activeTab === 'review' && (
              <>
                <div>
                  <h3 className="font-semibold text-purple-900 mb-2">Quality Score:</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          result.score >= 80 ? 'bg-green-500' :
                          result.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${result.score}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold text-purple-900">{result.score}/100</span>
                  </div>
                </div>
                
                {result.issues && result.issues.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-red-900 mb-2">Issues Found:</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {result.issues.map((issue: string, i: number) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {result.suggestions && result.suggestions.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Suggestions:</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {result.suggestions.map((suggestion: string, i: number) => (
                        <li key={i}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
