'use client';

import { useState, useEffect } from 'react';
import { Undo, Redo, History, RotateCcw } from 'lucide-react';

interface HistoryEntry {
  id: string;
  timestamp: Date;
  action: string;
  file?: string;
  before: string;
  after: string;
}

interface UndoRedoStackProps {
  onUndo: (entry: HistoryEntry) => void;
  onRedo: (entry: HistoryEntry) => void;
}

export default function UndoRedoStack({ onUndo, onRedo }: UndoRedoStackProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('code_history');
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      setHistory(parsed.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      })));
      setCurrentIndex(parsed.length - 1);
    }

    // Listen for code change events
    const handleCodeChange = (event: CustomEvent) => {
      const { action, file, before, after } = event.detail;
      const newEntry: HistoryEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        action,
        file,
        before,
        after
      };

      setHistory(prev => {
        const newHistory = [...prev.slice(0, currentIndex + 1), newEntry];
        localStorage.setItem('code_history', JSON.stringify(newHistory));
        return newHistory;
      });
      setCurrentIndex(prev => prev + 1);
    };

    window.addEventListener('codeChange' as any, handleCodeChange);
    return () => window.removeEventListener('codeChange' as any, handleCodeChange);
  }, [currentIndex]);

  const handleUndo = () => {
    if (currentIndex >= 0) {
      const entry = history[currentIndex];
      onUndo(entry);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleRedo = () => {
    if (currentIndex < history.length - 1) {
      const entry = history[currentIndex + 1];
      onRedo(entry);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleJumpTo = (index: number) => {
    if (index < currentIndex) {
      // Undo to this point
      for (let i = currentIndex; i > index; i--) {
        onUndo(history[i]);
      }
    } else if (index > currentIndex) {
      // Redo to this point
      for (let i = currentIndex + 1; i <= index; i++) {
        onRedo(history[i]);
      }
    }
    setCurrentIndex(index);
  };

  const clearHistory = () => {
    if (confirm('Clear all history?')) {
      setHistory([]);
      setCurrentIndex(-1);
      localStorage.removeItem('code_history');
    }
  };

  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;

  return (
    <>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-32 right-4 flex flex-col gap-2 z-40">
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className={`p-3 rounded-full shadow-lg transition-all ${
            canUndo
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
          title="Undo"
        >
          <Undo className="w-5 h-5" />
        </button>
        
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className={`p-3 rounded-full shadow-lg transition-all ${
            canRedo
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
          title="Redo"
        >
          <Redo className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all"
          title="History"
        >
          <History className="w-5 h-5" />
        </button>
      </div>

      {/* History Panel */}
      {isOpen && (
        <div className="fixed bottom-48 right-4 w-96 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-2xl border border-indigo-500/30 z-50 max-h-[60vh] overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-white" />
              <h3 className="font-bold text-white">Change History</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <div className="p-4 overflow-y-auto max-h-[calc(60vh-120px)]">
            {history.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No history yet. Make some changes!
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      index === currentIndex
                        ? 'bg-indigo-600/20 border-indigo-500'
                        : index < currentIndex
                        ? 'bg-gray-800 border-gray-700 opacity-60'
                        : 'bg-gray-800 border-gray-700 opacity-40'
                    }`}
                    onClick={() => handleJumpTo(index)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-white">
                        {entry.action}
                      </span>
                      <span className="text-xs text-gray-400">
                        {entry.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    {entry.file && (
                      <div className="text-xs text-gray-400 truncate">
                        {entry.file}
                      </div>
                    )}
                    {index === currentIndex && (
                      <div className="mt-2 text-xs text-indigo-400 font-semibold">
                        ← Current State
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-800 border-t border-gray-700 p-3 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {history.length} changes
            </span>
            <button
              onClick={clearHistory}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Clear
            </button>
          </div>
        </div>
      )}
    </>
  );
}
