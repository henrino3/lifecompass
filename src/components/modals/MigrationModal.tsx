'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  migrateLocalToCloud,
  clearLocalStorageAfterMigration,
  getLocalDataSummary,
} from '@/lib/migration/localToCloud';

interface MigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onMigrationComplete: () => void;
}

export function MigrationModal({
  isOpen,
  onClose,
  userId,
  onMigrationComplete,
}: MigrationModalProps) {
  const [status, setStatus] = useState<'idle' | 'migrating' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<{ reflections: number; achievements: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const summary = getLocalDataSummary();

  const handleMigrate = async () => {
    setStatus('migrating');
    setError(null);

    try {
      const migrationResult = await migrateLocalToCloud(userId);

      if (migrationResult.success) {
        setResult({
          reflections: migrationResult.migratedReflections,
          achievements: migrationResult.migratedAchievements,
        });
        clearLocalStorageAfterMigration();
        setStatus('success');
      } else {
        setError(migrationResult.errors.join(', '));
        setStatus('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed');
      setStatus('error');
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const handleDone = () => {
    onMigrationComplete();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[var(--surface)] rounded-2xl p-6 max-w-md w-full"
        >
          {status === 'idle' && (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                  <span className="text-3xl">☁️</span>
                </div>
                <h3 className="font-display text-2xl mb-2">Sync Your Data</h3>
                <p className="text-[var(--text-muted)]">
                  We found local reflections on this device
                </p>
              </div>

              <div className="mb-6 p-4 rounded-xl bg-[var(--bg)]">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Reflections:</span>
                    <span className="text-[var(--text)]">{summary.reflectionCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Achievements:</span>
                    <span className="text-[var(--text)]">{summary.achievementCount}</span>
                  </div>
                  {summary.years.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Years:</span>
                      <span className="text-[var(--text)]">{summary.years.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <button onClick={handleMigrate} className="btn btn-primary w-full">
                  Upload to Cloud
                </button>
                <button
                  onClick={handleSkip}
                  className="w-full text-center text-[var(--text-muted)] hover:text-[var(--text)] text-sm"
                >
                  Skip for now
                </button>
              </div>

              <p className="mt-4 text-xs text-[var(--text-muted)] text-center">
                Uploading syncs your data across all devices
              </p>
            </>
          )}

          {status === 'migrating' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--accent)]/20 flex items-center justify-center animate-pulse">
                <span className="text-3xl">⏳</span>
              </div>
              <h3 className="font-display text-xl mb-2">Syncing...</h3>
              <p className="text-[var(--text-muted)]">
                Uploading your reflections to the cloud
              </p>
            </div>
          )}

          {status === 'success' && result && (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-3xl">✅</span>
                </div>
                <h3 className="font-display text-2xl mb-2">Sync Complete!</h3>
                <p className="text-[var(--text-muted)]">
                  Your data is now safely in the cloud
                </p>
              </div>

              <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="space-y-2 text-sm text-green-300">
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>{result.reflections} reflection{result.reflections !== 1 ? 's' : ''} synced</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>{result.achievements} achievement{result.achievements !== 1 ? 's' : ''} synced</span>
                  </div>
                </div>
              </div>

              <button onClick={handleDone} className="btn btn-primary w-full">
                Continue
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h3 className="font-display text-2xl mb-2">Sync Failed</h3>
                <p className="text-[var(--text-muted)]">
                  {error || 'Something went wrong'}
                </p>
              </div>

              <div className="space-y-3">
                <button onClick={handleMigrate} className="btn btn-primary w-full">
                  Try Again
                </button>
                <button
                  onClick={handleSkip}
                  className="w-full text-center text-[var(--text-muted)] hover:text-[var(--text)] text-sm"
                >
                  Skip for now
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
