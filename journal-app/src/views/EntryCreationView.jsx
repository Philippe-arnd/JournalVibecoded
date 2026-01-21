import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, X, Check, Loader2 } from 'lucide-react';
import { entryService } from '../services/entryService';

const SECTIONS = [
  {
    id: 'professional',
    title: 'Professional Recap',
    prompt: 'What did you accomplish professionally?',
    helper: 'Think about work wins, meetings, projects, or challenges'
  },
  {
    id: 'personal',
    title: 'Personal Recap',
    prompt: 'What did you do with your personal time?',
    helper: 'Time with family/friends, hobbies, exercise, self-care'
  },
  {
    id: 'learning',
    title: 'Learning Reflections',
    prompt: 'What did you learn recently?',
    helper: 'From podcasts, books, conversations, or experiences'
  },
  {
    id: 'gratitude',
    title: 'Gratitude',
    prompt: 'What are you grateful for today?',
    helper: 'Big or small, personal or professional'
  }
];

export default function EntryCreationView({ onClose, onFinish, initialEntry }) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [entryData, setEntryData] = useState({
    entry_date: initialEntry?.entry_date || new Date().toISOString().split('T')[0],
    professional_recap: initialEntry?.professional_recap || '',
    personal_recap: initialEntry?.personal_recap || '',
    learning_reflections: initialEntry?.learning_reflections || '',
    gratitude: initialEntry?.gratitude || ''
  });

  // Calculate direction for animation (1 for next, -1 for prev)
  const [direction, setDirection] = useState(0);

  const saveProgress = async (completed = false) => {
    setIsSaving(true);
    try {
      await entryService.saveEntry({
        ...entryData,
        completed
      });
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    await saveProgress(false); // Auto-save on navigation
    if (currentSectionIndex < SECTIONS.length - 1) {
      setDirection(1);
      setCurrentSectionIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentSectionIndex > 0) {
      setDirection(-1);
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    await saveProgress(true);
    onFinish();
  };

  // Variants for card stack animation
  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
      rotate: direction > 0 ? 5 : -5,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotate: 0,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
      rotate: direction < 0 ? 5 : -5,
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  return (
    <div className="fixed inset-0 bg-journal-50 text-journal-900 font-sans flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-2 flex justify-between items-center z-50">
        <button onClick={onClose} className="p-2 -ml-2 text-journal-500 hover:text-journal-900 transition-colors">
          <X size={24} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-sm font-serif font-bold text-journal-900">
            {new Date(entryData.entry_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          <div className="text-xs font-medium text-journal-400">
            {currentSectionIndex + 1} / {SECTIONS.length}
          </div>
        </div>
        <div className="w-8 flex justify-end">
          {isSaving && <Loader2 size={16} className="animate-spin text-journal-400" />}
        </div>
      </div>

      {/* Card Stack Container */}
      <div className="flex-1 relative flex items-center justify-center p-6">
        {/* Stack visuals - Next cards peeking */}
        {[3, 2, 1].map((offset) => {
          const index = (currentSectionIndex + offset) % SECTIONS.length;
          const section = SECTIONS[index];
          // Map section ID to DB field name
          const fieldName = section.id === 'professional' ? 'professional_recap' 
            : section.id === 'personal' ? 'personal_recap'
            : section.id === 'learning' ? 'learning_reflections'
            : 'gratitude';
            
          const hasContent = entryData[fieldName]?.trim().length > 0;
          
          // Alternating rotations to show corners
          const rotate = offset === 1 ? 3 : offset === 2 ? -2 : 1;
          const translateY = offset * 12;
          const scale = 1 - offset * 0.05;

          return (
            <div
              key={section.id}
              className="absolute w-full max-w-lg bg-white rounded-3xl shadow-sm border border-journal-200 h-[65vh] md:h-[600px] transition-all duration-500 ease-in-out flex flex-col overflow-hidden"
              style={{
                zIndex: -offset,
                transform: `translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
                opacity: Math.max(0.5, 1 - offset * 0.15),
              }}
            >
              {hasContent && (
                <div className="absolute top-6 right-6 text-journal-500 bg-journal-50 rounded-full p-1 z-20 shadow-sm">
                  <Check size={20} />
                </div>
              )}
              
              <div className="p-8 flex-1 flex flex-col opacity-20 pointer-events-none select-none">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-journal-900 mb-2">
                  {section.title}
                </h2>
                <p className="text-journal-500 text-lg">
                  {section.prompt}
                </p>
              </div>
            </div>
          );
        })}

        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSectionIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (swipe < -swipeConfidenceThreshold) {
                handleNext();
              } else if (swipe > swipeConfidenceThreshold) {
                handlePrev();
              }
            }}
            className="absolute w-full max-w-lg bg-white rounded-3xl shadow-xl border border-journal-200 flex flex-col h-[65vh] md:h-[600px] z-10"
          >
            {/* Tic Mark */}
            {(() => {
               const section = SECTIONS[currentSectionIndex];
               const fieldName = section.id === 'professional' ? 'professional_recap' 
                : section.id === 'personal' ? 'personal_recap'
                : section.id === 'learning' ? 'learning_reflections'
                : 'gratitude';
               return entryData[fieldName]?.trim().length > 0;
            })() && (
              <div className="absolute top-6 right-6 text-journal-500 bg-journal-50 rounded-full p-1">
                <Check size={20} />
              </div>
            )}

            <div className="p-8 flex-1 flex flex-col">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-journal-900 mb-2">
                {SECTIONS[currentSectionIndex].title}
              </h2>
              <p className="text-journal-500 text-lg mb-6">
                {SECTIONS[currentSectionIndex].prompt}
              </p>
              
              <textarea
                className="flex-1 w-full resize-none outline-none text-lg text-journal-900 placeholder:text-journal-200 bg-transparent"
                placeholder="Type here..."
                value={(() => {
                   const section = SECTIONS[currentSectionIndex];
                   const fieldName = section.id === 'professional' ? 'professional_recap' 
                    : section.id === 'personal' ? 'personal_recap'
                    : section.id === 'learning' ? 'learning_reflections'
                    : 'gratitude';
                   return entryData[fieldName];
                })()}
                onChange={(e) => {
                   const section = SECTIONS[currentSectionIndex];
                   const fieldName = section.id === 'professional' ? 'professional_recap' 
                    : section.id === 'personal' ? 'personal_recap'
                    : section.id === 'learning' ? 'learning_reflections'
                    : 'gratitude';
                   setEntryData({ ...entryData, [fieldName]: e.target.value });
                }}
                autoFocus
              />
              
              <div className="mt-4 text-sm text-journal-200 italic">
                {SECTIONS[currentSectionIndex].helper}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="p-8 pb-12 flex justify-between items-center max-w-lg mx-auto w-full z-10">
        <button 
          onClick={handlePrev}
          disabled={currentSectionIndex === 0}
          className={`p-4 rounded-full transition-all ${
            currentSectionIndex === 0 
              ? 'text-journal-200 cursor-not-allowed' 
              : 'bg-white text-journal-900 shadow-md hover:scale-110 active:scale-95'
          }`}
        >
          <ArrowLeft size={24} />
        </button>

        <button 
          onClick={handleNext}
          className="bg-journal-accent text-white p-4 rounded-full shadow-lg shadow-journal-accent/30 hover:scale-110 active:scale-95 transition-all"
        >
          {currentSectionIndex === SECTIONS.length - 1 ? <Check size={28} /> : <ArrowRight size={28} />}
        </button>
      </div>
    </div>
  );
}