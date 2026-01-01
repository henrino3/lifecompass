'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { StarField } from '@/components/effects/StarField';
import { useCompassStore } from '@/lib/store';
import { getQuestionsForMode, getQuestionsBySection } from '@/lib/questions';
import { Question, LIFE_AREAS, MONTHS, MODE_INFO } from '@/lib/types';

// Question Card Component
function QuestionCard({
  question,
  value,
  onChange
}: {
  question: Question;
  value: string | string[] | Record<string, number>;
  onChange: (value: string | string[] | Record<string, number>) => void;
}) {
  if (question.type === 'text' || question.type === 'word') {
    return (
      <input
        type="text"
        className="input text-lg md:text-xl py-4"
        placeholder={question.placeholder}
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
      />
    );
  }

  if (question.type === 'textarea') {
    return (
      <textarea
        className="input text-lg min-h-[200px] md:min-h-[250px]"
        placeholder={question.placeholder}
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
      />
    );
  }

  if (question.type === 'list') {
    const count = question.listCount || 3;
    const items = (value as string[]) || Array(count).fill('');

    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-[var(--accent)] font-display text-xl mt-3">{i + 1}.</span>
            <textarea
              className="input flex-1 min-h-[80px]"
              placeholder={question.placeholder}
              value={items[i] || ''}
              onChange={(e) => {
                const newItems = [...items];
                newItems[i] = e.target.value;
                onChange(newItems);
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (question.type === 'rating') {
    const ratings = (value as Record<string, number>) || {};

    return (
      <div className="space-y-6">
        {LIFE_AREAS.map((area) => (
          <div key={area.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-xl">{area.icon}</span>
                <span>{area.name}</span>
              </span>
              <span className="text-[var(--accent)] font-display text-xl">
                {ratings[area.id] || 0}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={ratings[area.id] || 5}
              onChange={(e) => {
                onChange({
                  ...ratings,
                  [area.id]: parseInt(e.target.value),
                });
              }}
              className="w-full h-2 bg-[var(--surface)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
            />
            <div className="flex justify-between text-xs text-[var(--text-muted)]">
              <span>Unsatisfied</span>
              <span>Couldn&apos;t be better</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (question.type === 'calendar') {
    const events = (value as Record<string, string>) || {};

    return (
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {MONTHS.map((month) => (
          <div key={month} className="space-y-2">
            <label className="font-display text-lg text-[var(--accent)]">{month}</label>
            <textarea
              className="input min-h-[60px]"
              placeholder={`What happened in ${month}?`}
              value={events[month] || ''}
              onChange={(e) => {
                onChange({
                  ...events,
                  [month]: e.target.value,
                });
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  return null;
}

// Section Intro Component
function SectionIntro({
  section,
  onContinue
}: {
  section: 'past' | 'future';
  onContinue: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="text-center max-w-lg mx-auto"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-24 h-24 mx-auto mb-8 rounded-full bg-[var(--accent)]/20 flex items-center justify-center"
      >
        <span className="text-5xl">
          {section === 'past' ? '🔙' : '🔮'}
        </span>
      </motion.div>

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="font-display text-3xl md:text-4xl mb-4"
      >
        {section === 'past' ? 'Part One: Looking Back' : 'Part Two: Looking Forward'}
      </motion.h2>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-[var(--text-muted)] mb-8 text-lg"
      >
        {section === 'past'
          ? "Let's reflect on the year that's ending. What happened? What did you learn? What are you grateful for?"
          : "Now let's look ahead. What do you want? What will you create? Who will you become?"}
      </motion.p>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={onContinue}
        className="btn btn-primary text-lg px-8 py-4"
      >
        {section === 'past' ? 'Begin Reflection' : 'Design My Future'}
      </motion.button>
    </motion.div>
  );
}

// Completion Screen Component
function CompletionScreen({ onExport, onHome }: { onExport: () => void; onHome: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center max-w-lg mx-auto"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center glow"
      >
        <span className="text-6xl">🎉</span>
      </motion.div>

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="font-display text-4xl md:text-5xl mb-4"
      >
        Journey Complete!
      </motion.h2>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-[var(--text-muted)] mb-8 text-lg"
      >
        You&apos;ve completed your reflection. Your insights have been saved. Take these learnings with you into the new year.
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="space-y-4"
      >
        <button onClick={onExport} className="btn btn-primary w-full text-lg py-4">
          Download My Reflections
        </button>
        <button onClick={onHome} className="btn btn-secondary w-full">
          Return Home
        </button>
      </motion.div>
    </motion.div>
  );
}

// Export Modal Component
function ExportModal({
  isOpen,
  onClose,
  responses,
  mode,
  year
}: {
  isOpen: boolean;
  onClose: () => void;
  responses: Record<string, { value: string | string[] | Record<string, unknown> }>;
  mode: string;
  year: number;
}) {
  const questions = useMemo(() => getQuestionsForMode(mode as 'quick' | 'ok' | 'deep'), [mode]);

  const downloadCSV = () => {
    const rows: string[][] = [['Question', 'Response']];

    questions.forEach((q) => {
      const response = responses[q.id];
      if (response) {
        let value = '';
        if (typeof response.value === 'string') {
          value = response.value;
        } else if (Array.isArray(response.value)) {
          value = response.value.filter(Boolean).join('; ');
        } else if (typeof response.value === 'object') {
          value = Object.entries(response.value as Record<string, unknown>)
            .map(([k, v]) => `${k}: ${v}`)
            .join('; ');
        }
        rows.push([q.title, value.replace(/"/g, '""')]);
      }
    });

    const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lifecompass-${year}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async () => {
    // Dynamic import for PDF generation
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    let y = 20;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const maxWidth = doc.internal.pageSize.width - 2 * margin;

    // Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(`LifeCompass ${year}`, margin, y);
    y += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`${MODE_INFO[mode as keyof typeof MODE_INFO].name} Mode Reflection`, margin, y);
    y += 20;

    // Questions and responses
    questions.forEach((q) => {
      const response = responses[q.id];
      if (!response) return;

      // Check if we need a new page
      if (y > pageHeight - 40) {
        doc.addPage();
        y = 20;
      }

      // Question title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      const titleLines = doc.splitTextToSize(q.title, maxWidth);
      doc.text(titleLines, margin, y);
      y += titleLines.length * lineHeight + 5;

      // Response
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      let responseText = '';
      if (typeof response.value === 'string') {
        responseText = response.value || '(No response)';
      } else if (Array.isArray(response.value)) {
        responseText = response.value.filter(Boolean).map((v, i) => `${i + 1}. ${v}`).join('\n') || '(No response)';
      } else if (typeof response.value === 'object') {
        responseText = Object.entries(response.value as Record<string, unknown>)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n') || '(No response)';
      }

      const responseLines = doc.splitTextToSize(responseText, maxWidth);

      // Check for page break
      if (y + responseLines.length * lineHeight > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }

      doc.text(responseLines, margin, y);
      y += responseLines.length * lineHeight + 15;
    });

    doc.save(`lifecompass-${year}.pdf`);
  };

  if (!isOpen) return null;

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
          <h3 className="font-display text-2xl mb-4">Download Your Reflections</h3>
          <p className="text-[var(--text-muted)] mb-6">
            Choose a format to save your journey.
          </p>

          <div className="space-y-3">
            <button
              onClick={downloadPDF}
              className="btn btn-primary w-full justify-between"
            >
              <span>Download as PDF</span>
              <span>📄</span>
            </button>
            <button
              onClick={downloadCSV}
              className="btn btn-secondary w-full justify-between"
            >
              <span>Download as CSV</span>
              <span>📊</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="mt-4 w-full text-center text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function CompassPage() {
  const router = useRouter();
  const {
    mode,
    currentYear,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    responses,
    setResponse,
    getProgress,
    completeJourney,
    lastSaved,
  } = useCompassStore();

  const [showSectionIntro, setShowSectionIntro] = useState<'past' | 'future' | null>('past');
  const [showCompletion, setShowCompletion] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState(false);

  // Get questions for current mode
  const questions = useMemo(() => {
    if (!mode) return [];
    return getQuestionsForMode(mode);
  }, [mode]);

  const pastQuestions = useMemo(() => getQuestionsBySection(questions, 'past'), [questions]);
  const futureQuestions = useMemo(() => getQuestionsBySection(questions, 'future'), [questions]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = getProgress();

  // Determine current section
  const currentSection = currentQuestion?.section || 'past';
  const isFirstFutureQuestion = currentQuestion?.section === 'future' &&
    questions[currentQuestionIndex - 1]?.section === 'past';

  // Show section intro for future section
  useEffect(() => {
    if (isFirstFutureQuestion && showSectionIntro !== 'future') {
      setShowSectionIntro('future');
    }
  }, [isFirstFutureQuestion, showSectionIntro]);

  // Redirect if no mode selected
  useEffect(() => {
    if (!mode) {
      router.push('/');
    }
  }, [mode, router]);

  // Show save indicator
  useEffect(() => {
    if (lastSaved) {
      setSaveIndicator(true);
      const timer = setTimeout(() => setSaveIndicator(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved]);

  const handleResponse = useCallback((value: string | string[] | Record<string, number>) => {
    if (currentQuestion) {
      setResponse(currentQuestion.id, value);
    }
  }, [currentQuestion, setResponse]);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Journey complete
      completeJourney();
      setShowCompletion(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleExport = () => {
    setShowExport(true);
  };

  if (!mode || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-[var(--text-muted)]">Loading...</div>
      </div>
    );
  }

  const currentValue = responses[currentQuestion.id]?.value ||
    (currentQuestion.type === 'list' ? [] :
     currentQuestion.type === 'rating' ? {} :
     currentQuestion.type === 'calendar' ? {} : '');

  return (
    <main className="min-h-screen relative overflow-hidden">
      <StarField />

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)]/80 backdrop-blur-sm">
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between px-4 py-2 text-sm">
          <button
            onClick={() => router.push('/')}
            className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Home
          </button>
          <div className="flex items-center gap-4">
            <AnimatePresence>
              {saveIndicator && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[var(--accent)] flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved
                </motion.span>
              )}
            </AnimatePresence>
            <span className="text-[var(--text-muted)]">{progress}% complete</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col pt-16 pb-24">
        <AnimatePresence mode="wait">
          {showSectionIntro && !showCompletion ? (
            <motion.div
              key={`intro-${showSectionIntro}`}
              className="flex-1 flex items-center justify-center px-4"
            >
              <SectionIntro
                section={showSectionIntro}
                onContinue={() => setShowSectionIntro(null)}
              />
            </motion.div>
          ) : showCompletion ? (
            <motion.div
              key="completion"
              className="flex-1 flex items-center justify-center px-4"
            >
              <CompletionScreen
                onExport={handleExport}
                onHome={() => router.push('/')}
              />
            </motion.div>
          ) : (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col justify-center px-4 max-w-2xl mx-auto w-full"
            >
              {/* Section indicator */}
              <div className="mb-4 text-center">
                <span className="text-sm text-[var(--accent)] uppercase tracking-wide">
                  {currentSection === 'past' ? 'Looking Back' : 'Looking Forward'}
                </span>
                <span className="mx-2 text-[var(--text-muted)]">•</span>
                <span className="text-sm text-[var(--text-muted)]">
                  {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>

              {/* Question */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="font-display text-2xl md:text-3xl text-center mb-4"
              >
                {currentQuestion.title}
              </motion.h2>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-[var(--text-muted)] text-center mb-8"
              >
                {currentQuestion.prompt}
              </motion.p>

              {/* Answer input */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <QuestionCard
                  question={currentQuestion}
                  value={currentValue as string | string[] | Record<string, number>}
                  onChange={handleResponse}
                />
              </motion.div>

              {/* Quote */}
              {currentQuestion.quote && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 text-center text-sm text-[var(--text-muted)] italic"
                >
                  {currentQuestion.quote}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {!showSectionIntro && !showCompletion && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--bg)] to-transparent safe-area-bottom"
          >
            <div className="flex gap-4 max-w-2xl mx-auto">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="btn btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                className="btn btn-primary flex-1"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        responses={responses}
        mode={mode}
        year={currentYear}
      />
    </main>
  );
}
