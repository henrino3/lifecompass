'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Mode, MODE_INFO, Reflection } from '@/lib/types';

interface ModeUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceReflection: Reflection;
  availableModes: Mode[];
  onUpgrade: (toMode: Mode) => void;
}

export function ModeUpgradeModal({
  isOpen,
  onClose,
  sourceReflection,
  availableModes,
  onUpgrade,
}: ModeUpgradeModalProps) {
  if (!isOpen) return null;

  const getModeIcon = (mode: Mode) => {
    switch (mode) {
      case 'quick': return '⚡';
      case 'ok': return '✨';
      case 'deep': return '🌊';
    }
  };

  const getNewQuestionCount = (fromMode: Mode, toMode: Mode) => {
    const counts = { quick: 8, ok: 14, deep: 21 };
    return counts[toMode] - counts[fromMode];
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[var(--surface)] rounded-2xl p-6 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
              <span className="text-3xl">📈</span>
            </div>
            <h3 className="font-display text-2xl mb-2">Upgrade Your Reflection</h3>
            <p className="text-[var(--text-muted)]">
              Your previous answers will be pre-filled. You can edit them and answer new questions.
            </p>
          </div>

          <div className="mb-4 p-4 rounded-xl bg-[var(--bg)] text-sm">
            <p className="text-[var(--text-muted)] mb-2">Current reflection:</p>
            <div className="flex items-center gap-2">
              <span className="text-xl">{getModeIcon(sourceReflection.mode)}</span>
              <span className="font-display">{MODE_INFO[sourceReflection.mode].name} Mode</span>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <p className="text-sm text-[var(--text-muted)]">Choose new mode:</p>
            {availableModes.map((mode) => (
              <button
                key={mode}
                onClick={() => onUpgrade(mode)}
                className="w-full p-4 rounded-xl glass text-left card-hover flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getModeIcon(mode)}</span>
                  <div>
                    <div className="font-display">{MODE_INFO[mode].name}</div>
                    <div className="text-sm text-[var(--text-muted)]">{MODE_INFO[mode].time}</div>
                  </div>
                </div>
                <div className="text-sm text-[var(--accent)]">
                  +{getNewQuestionCount(sourceReflection.mode, mode)} questions
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-green-500/10 text-sm text-green-300 mb-4">
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Your {Object.keys(sourceReflection.responses).length} previous answers will be kept and can be edited</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full text-center text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          >
            Cancel
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
