'use client';

import { useState, useEffect } from 'react';
import { Skull, Clock, TrendingUp, Zap, CheckCircle, AlertTriangle, AlertCircle, XCircle } from 'lucide-react';

interface BugStats {
  totalBugsFixed: number;
  timeSaved: number;
  killStreak: number;
  bugsBySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recentFixes: Array<{
    file: string;
    severity: string;
    timeSaved: number;
    timestamp: Date;
  }>;
}

export default function BugGraveyard() {
  const [stats, setStats] = useState<BugStats>({
    totalBugsFixed: 0,
    timeSaved: 0,
    killStreak: 0,
    bugsBySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
    recentFixes: []
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Load stats from localStorage
    const savedStats = localStorage.getItem('bug_graveyard_stats');
    if (savedStats) {
      const parsed = JSON.parse(savedStats);
      setStats({
        ...parsed,
        recentFixes: parsed.recentFixes.map((fix: any) => ({
          ...fix,
          timestamp: new Date(fix.timestamp)
        }))
      });
    }

    // Listen for bug fix events
    const handleBugFixed = (event: CustomEvent) => {
      const { severity, timeSaved, file } = event.detail;
      setStats(prev => {
        const newStats = {
          totalBugsFixed: prev.totalBugsFixed + 1,
          timeSaved: prev.timeSaved + timeSaved,
          killStreak: prev.killStreak + 1,
          bugsBySeverity: {
            ...prev.bugsBySeverity,
            [severity]: (prev.bugsBySeverity[severity as keyof typeof prev.bugsBySeverity] || 0) + 1
          },
          recentFixes: [
            { file, severity, timeSaved, timestamp: new Date() },
            ...prev.recentFixes.slice(0, 9)
          ]
        };
        localStorage.setItem('bug_graveyard_stats', JSON.stringify(newStats));
        return newStats;
      });
    };

    window.addEventListener('bugFixed' as any, handleBugFixed);
    return () => window.removeEventListener('bugFixed' as any, handleBugFixed);
  }, []);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all z-50"
        title="Bug Graveyard"
      >
        <Skull className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 w-96 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-2xl border border-purple-500/30 z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skull className="w-6 h-6 text-white" />
          <h3 className="text-lg font-bold text-white">Bug Graveyard</h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      {/* Stats Grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Skull className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Bugs Killed</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalBugsFixed}</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Time Saved</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatTime(stats.timeSaved)}</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Kill Streak</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.killStreak}</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Efficiency</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.totalBugsFixed > 0 ? Math.round((stats.timeSaved / stats.totalBugsFixed) * 10) / 10 : 0}x
          </div>
        </div>
      </div>

      {/* Severity Breakdown */}
      <div className="px-4 pb-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">By Severity</h4>
        <div className="space-y-2">
          {Object.entries(stats.bugsBySeverity).map(([severity, count]) => (
            <div key={severity} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getSeverityIcon(severity)}
                <span className="text-sm text-gray-300 capitalize">{severity}</span>
              </div>
              <span className="text-sm font-semibold text-white">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Fixes */}
      {stats.recentFixes.length > 0 && (
        <div className="px-4 pb-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Recent Kills</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {stats.recentFixes.map((fix, idx) => (
              <div key={idx} className="bg-gray-800 rounded p-2 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-300 truncate flex-1">{fix.file.split('/').pop()}</span>
                  {getSeverityIcon(fix.severity)}
                </div>
                <div className="text-gray-500">
                  {formatTime(fix.timeSaved)} saved • {new Date(fix.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clear Stats */}
      <div className="px-4 pb-4">
        <button
          onClick={() => {
            if (confirm('Clear all stats?')) {
              localStorage.removeItem('bug_graveyard_stats');
              setStats({
                totalBugsFixed: 0,
                timeSaved: 0,
                killStreak: 0,
                bugsBySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
                recentFixes: []
              });
            }
          }}
          className="w-full py-2 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 text-sm"
        >
          Clear Stats
        </button>
      </div>
    </div>
  );
}
