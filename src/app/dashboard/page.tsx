'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { StarField } from '@/components/effects/StarField';
import { ReflectionCard } from '@/components/dashboard/ReflectionCard';
import { ModeUpgradeModal } from '@/components/modals/ModeUpgradeModal';
import { useCompassStore } from '@/lib/store';
import { useAuth } from '@/components/auth/AuthProvider';
import { Reflection, Mode, PERIOD_INFO, ReflectionPeriod } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user: authUser, signOut } = useAuth();
  const {
    reflections,
    loadReflection,
    upgradeMode,
    canUpgrade,
    isGuest,
    user: storeUser,
  } = useCompassStore();

  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedReflection, setSelectedReflection] = useState<Reflection | null>(null);

  const currentYear = new Date().getFullYear();

  // Group reflections by year
  const reflectionsByYear = useMemo(() => {
    const grouped: Record<number, Reflection[]> = {};
    reflections.forEach((r) => {
      if (!grouped[r.year]) grouped[r.year] = [];
      grouped[r.year].push(r);
    });
    return grouped;
  }, [reflections]);

  // Current year reflections
  const currentYearReflections = reflectionsByYear[currentYear] || [];

  // Past years (sorted descending)
  const pastYears = Object.keys(reflectionsByYear)
    .map(Number)
    .filter((y) => y < currentYear)
    .sort((a, b) => b - a);

  const handleView = (reflection: Reflection) => {
    loadReflection(reflection.id);
    router.push('/compass');
  };

  const handleContinue = (reflection: Reflection) => {
    loadReflection(reflection.id);
    router.push('/compass');
  };

  const handleUpgradeClick = (reflection: Reflection) => {
    setSelectedReflection(reflection);
    setUpgradeModalOpen(true);
  };

  const handleUpgrade = (toMode: Mode) => {
    if (selectedReflection) {
      upgradeMode(selectedReflection.id, toMode);
      setUpgradeModalOpen(false);
      router.push('/compass');
    }
  };

  const handleStartNew = (period: ReflectionPeriod) => {
    router.push(`/?period=${period}`);
  };

  const handleExport = (reflection: Reflection) => {
    loadReflection(reflection.id);
    router.push('/compass?export=true');
  };

  // Check what periods are available for current year
  const getAvailablePeriods = (): ReflectionPeriod[] => {
    const usedPeriods = currentYearReflections.map((r) => r.period);
    const allPeriods: ReflectionPeriod[] = ['q1', 'mid_year', 'year_end'];
    return allPeriods.filter((p) => !usedPeriods.includes(p));
  };

  const availablePeriods = getAvailablePeriods();

  return (
    <main className="min-h-screen relative overflow-hidden">
      <StarField />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)]/80 backdrop-blur-sm border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="font-display text-xl gradient-text"
          >
            LifeCompass
          </button>
          <div className="flex items-center gap-4">
            {authUser ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-[var(--text-muted)]">{authUser.email}</span>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)]"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push('/auth')}
                className="btn btn-secondary text-sm"
              >
                Sign in to sync
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl md:text-4xl mb-2">
              {authUser ? `Welcome back${storeUser?.fullName ? `, ${storeUser.fullName}` : ''}!` : 'Your Reflections'}
            </h1>
            <p className="text-[var(--text-muted)]">
              {reflections.length === 0
                ? "You haven't started any reflections yet."
                : `You have ${reflections.length} reflection${reflections.length > 1 ? 's' : ''}.`}
            </p>
          </motion.div>

          {/* Guest warning */}
          {isGuest && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="text-sm text-yellow-300 mb-2">
                    Your reflections are saved locally on this device only.
                  </p>
                  <button
                    onClick={() => router.push('/auth')}
                    className="text-sm text-[var(--accent)] hover:underline"
                  >
                    Sign in to sync across devices →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Current Year Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="font-display text-xl mb-4 flex items-center gap-2">
              <span>{currentYear}</span>
              <span className="text-[var(--accent)]">Current Year</span>
            </h2>

            {currentYearReflections.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {currentYearReflections.map((reflection) => {
                  const upgradeInfo = canUpgrade(reflection);
                  return (
                    <ReflectionCard
                      key={reflection.id}
                      reflection={reflection}
                      onView={() => handleView(reflection)}
                      onContinue={() => handleContinue(reflection)}
                      onUpgrade={() => handleUpgradeClick(reflection)}
                      onExport={() => handleExport(reflection)}
                      canUpgrade={upgradeInfo.canUpgrade && reflection.completed}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="glass rounded-2xl p-6 text-center">
                <p className="text-[var(--text-muted)] mb-4">
                  No reflections for {currentYear} yet.
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="btn btn-primary"
                >
                  Start Your Reflection
                </button>
              </div>
            )}

            {/* Start new period */}
            {availablePeriods.length > 0 && currentYearReflections.length > 0 && (
              <div className="mt-4 p-4 rounded-xl glass">
                <p className="text-sm text-[var(--text-muted)] mb-3">Start another reflection:</p>
                <div className="flex flex-wrap gap-2">
                  {availablePeriods.map((period) => (
                    <button
                      key={period}
                      onClick={() => handleStartNew(period)}
                      className="btn btn-secondary text-sm"
                    >
                      {PERIOD_INFO[period].name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.section>

          {/* Past Years */}
          {pastYears.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="font-display text-xl mb-4">Past Reflections</h2>
              <div className="space-y-6">
                {pastYears.map((year) => (
                  <div key={year}>
                    <h3 className="text-sm text-[var(--text-muted)] mb-3">{year}</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {reflectionsByYear[year].map((reflection) => {
                        const upgradeInfo = canUpgrade(reflection);
                        return (
                          <ReflectionCard
                            key={reflection.id}
                            reflection={reflection}
                            onView={() => handleView(reflection)}
                            onContinue={() => handleContinue(reflection)}
                            onUpgrade={() => handleUpgradeClick(reflection)}
                            onExport={() => handleExport(reflection)}
                            canUpgrade={upgradeInfo.canUpgrade && reflection.completed}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Empty state */}
          {reflections.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                <span className="text-5xl">🧭</span>
              </div>
              <h2 className="font-display text-2xl mb-4">Begin Your Journey</h2>
              <p className="text-[var(--text-muted)] mb-6 max-w-md mx-auto">
                Take time to reflect on your year and set intentions for the future.
              </p>
              <button
                onClick={() => router.push('/')}
                className="btn btn-primary text-lg px-8 py-4"
              >
                Start Your First Reflection
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mode Upgrade Modal */}
      {selectedReflection && (
        <ModeUpgradeModal
          isOpen={upgradeModalOpen}
          onClose={() => setUpgradeModalOpen(false)}
          sourceReflection={selectedReflection}
          availableModes={canUpgrade(selectedReflection).availableModes}
          onUpgrade={handleUpgrade}
        />
      )}
    </main>
  );
}
