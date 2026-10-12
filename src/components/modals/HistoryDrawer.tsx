import React from 'react';
import { History, X, Undo, Redo, RotateCcw } from 'lucide-react';
import { EditState } from '../../types/editor';

interface HistoryStep {
  name: string;
  timestamp: number;
  state: EditState;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  historyStack: HistoryStep[];
  currentIndex: number;
  onJumpToStep: (index: number) => void;
  onResetAll: () => void;
}

export const HistoryDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  historyStack,
  currentIndex,
  onJumpToStep,
  onResetAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-80 h-full liquid-panel-elevated bg-slate-950/90 border-l border-white/10 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Edit History
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg liquid-button text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* History States List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {historyStack.map((step, idx) => {
            const isCurrent = idx === currentIndex;
            const isFuture = idx > currentIndex;

            return (
              <div
                key={`${step.timestamp}_${idx}`}
                onClick={() => onJumpToStep(idx)}
                className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between text-xs ${
                  isCurrent
                    ? 'bg-sky-500/25 border border-sky-400 font-bold text-sky-200'
                    : isFuture
                    ? 'opacity-40 text-zinc-500 hover:opacity-75'
                    : 'liquid-panel text-zinc-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isCurrent ? 'bg-sky-400 shadow-sm' : 'bg-zinc-600'
                    }`}
                  />
                  <span>{step.name}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">
                  {new Date(step.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-white/10 flex items-center gap-2">
          <button
            onClick={() => onJumpToStep(Math.max(0, currentIndex - 1))}
            disabled={currentIndex <= 0}
            className="flex-1 py-2 rounded-xl liquid-button flex items-center justify-center gap-1.5 text-xs text-zinc-300 disabled:opacity-40"
          >
            <Undo className="w-3.5 h-3.5" /> Undo
          </button>
          <button
            onClick={() => onJumpToStep(Math.min(historyStack.length - 1, currentIndex + 1))}
            disabled={currentIndex >= historyStack.length - 1}
            className="flex-1 py-2 rounded-xl liquid-button flex items-center justify-center gap-1.5 text-xs text-zinc-300 disabled:opacity-40"
          >
            <Redo className="w-3.5 h-3.5" /> Redo
          </button>
          <button
            onClick={() => {
              if (confirm('Revert all adjustments to original?')) {
                onResetAll();
                onClose();
              }
            }}
            title="Reset All"
            className="p-2 rounded-xl liquid-button text-zinc-400 hover:text-rose-400"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
