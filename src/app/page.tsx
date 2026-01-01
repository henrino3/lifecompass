'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { StarField } from '@/components/effects/StarField';
import { useCompassStore } from '@/lib/store';
import { Mode, MODE_INFO, Theme } from '@/lib/types';

const THEMES: { id: Theme; name: string; preview: string }[] = [
  { id: 'cosmic', name: 'Cosmic', preview: 'bg-gradient-to-br from-[#0a0a1a] to-[#1a1a3a]' },
  { id: 'calm', name: 'Calm', preview: 'bg-gradient-to-br from-[#1a1f1c] to-[#2d3830]' },
  { id: 'minimal', name: 'Minimal', preview: 'bg-gradient-to-br from-[#0a0a0a] to-[#1f1f1f]' },
  { id: 'sunset', name: 'Sunset', preview: 'bg-gradient-to-br from-[#1a0a14] to-[#3a1e34]' },
];

export default function Home() {
  const router = useRouter();
  const {
    theme,
    setTheme,
    mode,
    startJourney,
    hasSeenWelcome,
    setHasSeenWelcome,
    getProgress,
    currentYear,
    responses,
  } = useCompassStore();

  const [step, setStep] = useState<'welcome' | 'theme' | 'mode' | 'ready'>('welcome');
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Check if user has an in-progress journey
  const hasInProgressJourney = mode && Object.keys(responses).length > 0;
  const progress = getProgress();

  useEffect(() => {
    // Apply theme on mount
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleStart = () => {
    if (hasInProgressJourney) {
      router.push('/compass');
    } else {
      setStep('theme');
    }
  };

  const handleThemeSelect = (selectedTheme: Theme) => {
    setTheme(selectedTheme);
    setStep('mode');
  };

  const handleModeSelect = (mode: Mode) => {
    setSelectedMode(mode);
    setStep('ready');
  };

  const handleBegin = () => {
    if (selectedMode) {
      startJourney(new Date().getFullYear(), selectedMode);
      setHasSeenWelcome(true);
      router.push('/compass');
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      <StarField />

      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg)] pointer-events-none z-[1]" />

      {/* Settings button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="fixed top-4 right-4 z-50 p-3 rounded-full glass hover:bg-white/10 transition-colors"
        aria-label="Settings"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-16 right-4 z-50 w-64 p-4 rounded-2xl glass"
          >
            <h3 className="font-display text-lg mb-4">Theme</h3>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-3 rounded-xl ${t.preview} border-2 transition-all ${
                    theme === t.id ? 'border-[var(--accent)]' : 'border-transparent'
                  }`}
                >
                  <span className="text-sm text-white">{t.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-2xl mx-auto"
            >
              {/* Logo/Title */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-8"
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center glow">
                  <svg className="w-12 h-12 text-[var(--bg)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
                  <span className="gradient-text">LifeCompass</span>
                </h1>
                <p className="text-xl text-[var(--text-muted)]">
                  Reflect on your year. Design your future.
                </p>
              </motion.div>

              {/* Continue existing journey */}
              {hasInProgressJourney && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-8 p-6 rounded-2xl glass"
                >
                  <p className="text-sm text-[var(--text-muted)] mb-2">You have a journey in progress</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display text-lg">{currentYear} • {MODE_INFO[mode!].name}</span>
                    <span className="text-[var(--accent)]">{progress}% complete</span>
                  </div>
                  <div className="progress-bar mb-4">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <button
                    onClick={() => router.push('/compass')}
                    className="btn btn-primary w-full"
                  >
                    Continue Journey
                  </button>
                </motion.div>
              )}

              {/* Features */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid gap-4 mb-8 text-left"
              >
                {[
                  { icon: '✨', text: 'Your answers save automatically' },
                  { icon: '🔄', text: 'Come back anytime to continue' },
                  { icon: '📥', text: 'Download your reflections to keep forever' },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl glass">
                    <span className="text-2xl">{feature.icon}</span>
                    <span className="text-[var(--text-muted)]">{feature.text}</span>
                  </div>
                ))}
              </motion.div>

              {/* Start button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                onClick={handleStart}
                className="btn btn-primary text-lg px-8 py-4"
              >
                {hasInProgressJourney ? 'Start Fresh' : 'Begin Your Journey'}
              </motion.button>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-6 text-sm text-[var(--text-muted)]"
              >
                Takes 15-90 minutes depending on depth
              </motion.p>
            </motion.div>
          )}

          {step === 'theme' && (
            <motion.div
              key="theme"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-xl mx-auto w-full"
            >
              <h2 className="font-display text-3xl md:text-4xl mb-4">Choose Your Atmosphere</h2>
              <p className="text-[var(--text-muted)] mb-8">
                Select a theme that resonates with you
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {THEMES.map((t, i) => (
                  <motion.button
                    key={t.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => handleThemeSelect(t.id)}
                    className={`p-6 rounded-2xl ${t.preview} border-2 card-hover ${
                      theme === t.id ? 'border-[var(--accent)] glow' : 'border-white/10'
                    }`}
                  >
                    <span className="font-display text-lg text-white">{t.name}</span>
                  </motion.button>
                ))}
              </div>

              <button
                onClick={() => setStep('welcome')}
                className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
              >
                ← Back
              </button>
            </motion.div>
          )}

          {step === 'mode' && (
            <motion.div
              key="mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-2xl mx-auto w-full"
            >
              <h2 className="font-display text-3xl md:text-4xl mb-4">How Deep Do You Want to Go?</h2>
              <p className="text-[var(--text-muted)] mb-8">
                Choose your reflection depth
              </p>

              <div className="space-y-4 mb-8">
                {(Object.entries(MODE_INFO) as [Mode, typeof MODE_INFO[Mode]][]).map(([key, info], i) => (
                  <motion.button
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => handleModeSelect(key)}
                    className={`w-full p-6 rounded-2xl glass text-left card-hover flex items-center justify-between ${
                      selectedMode === key ? 'border-2 border-[var(--accent)]' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-display text-xl">{info.name}</span>
                        <span className="text-sm px-2 py-1 rounded-full bg-[var(--accent)]/20 text-[var(--accent)]">
                          {info.time}
                        </span>
                      </div>
                      <p className="text-[var(--text-muted)]">{info.description}</p>
                    </div>
                    <div className="text-[var(--accent)] text-2xl">
                      {key === 'quick' && '⚡'}
                      {key === 'ok' && '✨'}
                      {key === 'deep' && '🌊'}
                    </div>
                  </motion.button>
                ))}
              </div>

              <button
                onClick={() => setStep('theme')}
                className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
              >
                ← Back
              </button>
            </motion.div>
          )}

          {step === 'ready' && selectedMode && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center max-w-lg mx-auto"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--accent)]/20 flex items-center justify-center"
              >
                <span className="text-4xl">
                  {selectedMode === 'quick' && '⚡'}
                  {selectedMode === 'ok' && '✨'}
                  {selectedMode === 'deep' && '🌊'}
                </span>
              </motion.div>

              <h2 className="font-display text-3xl md:text-4xl mb-4">Ready to Begin</h2>
              <p className="text-[var(--text-muted)] mb-2">
                {MODE_INFO[selectedMode].name} Mode • {MODE_INFO[selectedMode].time}
              </p>
              <p className="text-[var(--text-muted)] mb-8">
                Find a quiet space. Take a deep breath. Let&apos;s begin your journey of reflection.
              </p>

              <div className="space-y-4">
                <button
                  onClick={handleBegin}
                  className="btn btn-primary w-full text-lg py-4"
                >
                  Start Reflection
                </button>
                <button
                  onClick={() => setStep('mode')}
                  className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                >
                  ← Choose different mode
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-4 left-0 right-0 text-center text-sm text-[var(--text-muted)] z-10">
        <p>Inspired by YearCompass</p>
      </footer>
    </main>
  );
}
