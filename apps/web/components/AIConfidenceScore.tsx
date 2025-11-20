'use client';

import { Brain, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface AIConfidenceScoreProps {
  confidence: number;
  explanation: string;
  potentialIssues?: string[];
  suggestedTests?: string[];
}

export default function AIConfidenceScore({
  confidence,
  explanation,
  potentialIssues = [],
  suggestedTests = []
}: AIConfidenceScoreProps) {
  const getConfidenceColor = () => {
    if (confidence >= 90) return 'text-green-500 bg-green-500/10 border-green-500/30';
    if (confidence >= 70) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
    return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
  };

  const getConfidenceLabel = () => {
    if (confidence >= 90) return 'High Confidence';
    if (confidence >= 70) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 space-y-4">
      {/* Confidence Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-purple-400" />
          <div>
            <div className="text-sm text-gray-400">AI Confidence</div>
            <div className="text-lg font-bold text-white">{getConfidenceLabel()}</div>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-lg border font-bold text-2xl ${getConfidenceColor()}`}>
          {confidence}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            confidence >= 90
              ? 'bg-green-500'
              : confidence >= 70
              ? 'bg-yellow-500'
              : 'bg-orange-500'
          }`}
          style={{ width: `${confidence}%` }}
        />
      </div>

      {/* Explanation */}
      <div className="bg-gray-900/50 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-xs font-semibold text-blue-400 mb-1">What was fixed</div>
            <div className="text-sm text-gray-300">{explanation}</div>
          </div>
        </div>
      </div>

      {/* Potential Issues */}
      {potentialIssues.length > 0 && (
        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-xs font-semibold text-yellow-400 mb-1">Edge Cases to Consider</div>
              <ul className="text-sm text-gray-300 space-y-1">
                {potentialIssues.map((issue, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Suggested Tests */}
      {suggestedTests.length > 0 && (
        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-xs font-semibold text-green-400 mb-1">Recommended Tests</div>
              <ul className="text-sm text-gray-300 space-y-1">
                {suggestedTests.map((test, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>{test}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
