'use client';

import { useState } from 'react';
import { Skull, Clock, Zap, CheckCircle, AlertTriangle, AlertCircle, XCircle, FileCode, TrendingUp } from 'lucide-react';

interface ScanResult {
  file: string;
  language: string;
  issues: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    line?: number;
  }>;
}

interface ScanResultsDashboardProps {
  results: ScanResult[];
  onFixAll: (severity: string) => void;
  onClose: () => void;
}

export default function ScanResultsDashboard({ results, onFixAll, onClose }: ScanResultsDashboardProps) {
  const [fixing, setFixing] = useState(false);
  const [progress, setProgress] = useState(0);

  const stats = {
    totalFiles: results.length,
    totalIssues: results.reduce((sum, r) => sum + r.issues.length, 0),
    critical: results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'critical').length, 0),
    high: results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'high').length, 0),
    medium: results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'medium').length, 0),
    low: results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'low').length, 0),
  };

  const estimatedTimeManual = stats.totalIssues * 15; // 15 min per bug
  const estimatedTimeAI = Math.ceil(stats.totalIssues * 0.5); // 30 sec per bug

  const handleFixAll = async (severity: string) => {
    setFixing(true);
    setProgress(0);
    
    const issuesCount = stats[severity as keyof typeof stats] as number;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + (100 / issuesCount);
      });
    }, 500);

    await onFixAll(severity);
    
    clearInterval(interval);
    setProgress(100);
    setTimeout(() => setFixing(false), 1000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-5 h-5" />;
      case 'high': return <AlertCircle className="w-5 h-5" />;
      case 'medium': return <AlertTriangle className="w-5 h-5" />;
      default: return <CheckCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-purple-500/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Scan Complete</h2>
              <p className="text-purple-100">Found {stats.totalIssues} issues across {stats.totalFiles} files</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <FileCode className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-gray-400">Files Scanned</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalFiles}</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Skull className="w-5 h-5 text-red-400" />
                <span className="text-sm text-gray-400">Total Issues</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalIssues}</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-gray-400">Manual Time</span>
              </div>
              <div className="text-3xl font-bold text-white">{Math.floor(estimatedTimeManual / 60)}h</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-400">AI Time</span>
              </div>
              <div className="text-3xl font-bold text-white">{estimatedTimeAI}m</div>
            </div>
          </div>

          {/* Time Saved Banner */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {Math.floor((estimatedTimeManual - estimatedTimeAI) / 60)}h {(estimatedTimeManual - estimatedTimeAI) % 60}m saved
                  </div>
                  <div className="text-sm text-gray-300">
                    That's {Math.round((estimatedTimeManual / estimatedTimeAI) * 10) / 10}x faster than manual fixing
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Severity Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {(['critical', 'high', 'medium', 'low'] as const).map(severity => {
              const count = stats[severity];
              if (count === 0) return null;
              
              return (
                <div key={severity} className={`rounded-lg p-4 border ${getSeverityColor(severity)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(severity)}
                      <span className="font-semibold capitalize">{severity}</span>
                    </div>
                    <span className="text-2xl font-bold">{count}</span>
                  </div>
                  <button
                    onClick={() => handleFixAll(severity)}
                    disabled={fixing}
                    className={`w-full py-2 rounded font-medium transition-colors ${
                      fixing
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {fixing ? 'Fixing...' : `Fix All ${severity}`}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          {fixing && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Fixing bugs...</span>
                <span className="text-sm text-gray-300">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* File List */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Issues by File</h3>
            <div className="space-y-3">
              {results.map((result, idx) => (
                <div key={idx} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-purple-400" />
                      <span className="font-medium text-white">{result.file}</span>
                      <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                        {result.language}
                      </span>
                    </div>
                    <span className="text-sm text-gray-400">{result.issues.length} issues</span>
                  </div>
                  <div className="space-y-1">
                    {result.issues.slice(0, 3).map((issue, issueIdx) => (
                      <div key={issueIdx} className="flex items-start gap-2 text-sm">
                        <span className={`${getSeverityColor(issue.severity)} px-2 py-0.5 rounded text-xs font-medium`}>
                          {issue.severity}
                        </span>
                        <span className="text-gray-300">{issue.description}</span>
                      </div>
                    ))}
                    {result.issues.length > 3 && (
                      <div className="text-xs text-gray-500 ml-2">
                        +{result.issues.length - 3} more issues
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-800 border-t border-gray-700 p-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => handleFixAll('all')}
            disabled={fixing}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {fixing ? 'Fixing All Bugs...' : 'Fix All Bugs Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
