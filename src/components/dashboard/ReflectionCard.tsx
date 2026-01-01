'use client';

import { motion } from 'framer-motion';
import { Reflection, MODE_INFO, PERIOD_INFO } from '@/lib/types';

interface ReflectionCardProps {
  reflection: Reflection;
  onView: () => void;
  onContinue?: () => void;
  onUpgrade?: () => void;
  onExport?: () => void;
  canUpgrade?: boolean;
}

export function ReflectionCard({
  reflection,
  onView,
  onContinue,
  onUpgrade,
  onExport,
  canUpgrade = false,
}: ReflectionCardProps) {
  const modeInfo = MODE_INFO[reflection.mode];
  const periodInfo = PERIOD_INFO[reflection.period];

  const getModeIcon = () => {
    switch (reflection.mode) {
      case 'quick': return '⚡';
      case 'ok': return '✨';
      case 'deep': return '🌊';
    }
  };

  const getStatusColor = () => {
    if (reflection.completed) return 'text-green-400';
    if (reflection.progress > 0) return 'text-yellow-400';
    return 'text-[var(--text-muted)]';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 card-hover"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{getModeIcon()}</span>
            <span className="font-display text-lg">{modeInfo.name} Mode</span>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            {reflection.year} {periodInfo.name}
          </p>
        </div>
        <div className={`text-sm ${getStatusColor()}`}>
          {reflection.completed ? (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Complete
            </span>
          ) : (
            `${reflection.progress}%`
          )}
        </div>
      </div>

      {/* Progress bar */}
      {!reflection.completed && (
        <div className="progress-bar mb-4">
          <div className="progress-bar-fill" style={{ width: `${reflection.progress}%` }} />
        </div>
      )}

      {/* Summary of key responses */}
      {reflection.completed && (
        <div className="mb-4 space-y-2 text-sm">
          {reflection.responses['word_of_year']?.value && (
            <div className="flex items-center gap-2">
              <span className="text-[var(--accent)]">Word of Year:</span>
              <span className="text-[var(--text)]">{String(reflection.responses['word_of_year'].value)}</span>
            </div>
          )}
          {reflection.responses['three_words']?.value && (
            <div className="flex items-center gap-2">
              <span className="text-[var(--accent)]">Three Words:</span>
              <span className="text-[var(--text-muted)]">
                {(reflection.responses['three_words'].value as string[]).filter(Boolean).join(', ')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {reflection.completed ? (
          <>
            <button onClick={onView} className="btn btn-secondary text-sm flex-1">
              View
            </button>
            {canUpgrade && onUpgrade && (
              <button onClick={onUpgrade} className="btn btn-primary text-sm flex-1">
                Upgrade Mode
              </button>
            )}
            {onExport && (
              <button onClick={onExport} className="btn btn-secondary text-sm">
                Export
              </button>
            )}
          </>
        ) : (
          <button onClick={onContinue} className="btn btn-primary text-sm w-full">
            Continue
          </button>
        )}
      </div>

      {/* Upgrade hint */}
      {canUpgrade && reflection.completed && (
        <p className="mt-3 text-xs text-[var(--text-muted)] text-center">
          Upgrade to get deeper insights with more questions
        </p>
      )}
    </motion.div>
  );
}
