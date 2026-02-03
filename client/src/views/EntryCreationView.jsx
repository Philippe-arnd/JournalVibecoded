import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, X, Check, Loader2, Bold, List, Indent, Outdent } from 'lucide-react';
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

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || '';
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const exec = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex gap-1 mb-2 border-b border-journal-100 pb-2">
        <button 
          onClick={() => exec('bold')}
          className="p-1.5 text-journal-400 hover:text-journal-900 hover:bg-journal-50 rounded transition-colors"
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <div className="w-px bg-journal-100 mx-1" />
        <button 
          onClick={() => exec('insertUnorderedList')}
          className="p-1.5 text-journal-400 hover:text-journal-900 hover:bg-journal-50 rounded transition-colors"
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button 
          onClick={() => exec('outdent')}
          className="p-1.5 text-journal-400 hover:text-journal-900 hover:bg-journal-50 rounded transition-colors"
          title="Outdent"
        >
          <Outdent size={18} />
        </button>
        <button 
          onClick={() => exec('indent')}
          className="p-1.5 text-journal-400 hover:text-journal-900 hover:bg-journal-50 rounded transition-colors"
          title="Indent"
        >
          <Indent size={18} />
        </button>
      </div>
      
      <div
        ref={editorRef}
        contentEditable
        className="flex-1 overflow-y-auto outline-none text-lg text-journal-900 prose prose-journal 
          [&_ul]:list-disc [&_ul]:pl-5 
          [&_ol]:list-decimal [&_ol]:pl-5 
          [&_ul_ul]:list-[circle] [&_ul_ul_ul]:list-[square]
          [&_blockquote]:border-l-4 [&_blockquote]:border-journal-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:ml-0"
        onInput={handleInput}
        placeholder={placeholder}
        style={{ minHeight: '150px' }} 
      />
    </div>
  );
};

export default function EntryCreationView({ onClose, onFinish, initialEntry }) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  // Helper for local YYYY-MM-DD
  const getLocalDateStr = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [entryData, setEntryData] = useState({
    entry_date: initialEntry?.entry_date || getLocalDateStr(new Date()),
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
    <div className="fixed inset-0 bg-journal-50/80 backdrop-blur-sm text-journal-900 font-sans flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-2 flex justify-between items-center z-50">
        <button onClick={onClose} className="p-2 -ml-2 text-journal-500 hover:text-journal-900 transition-colors bg-white/50 rounded-full hover:bg-white">
          <X size={24} />
        </button>
        <div className="flex items-center gap-3">
           <div className="text-xs font-bold text-journal-400 uppercase tracking-widest">
              {currentSectionIndex + 1} / {SECTIONS.length}
          </div>
          <div className="w-4 flex justify-end">
            {isSaving && <Loader2 size={16} className="animate-spin text-journal-400" />}
          </div>
        </div>
      </div>

      {/* Card Stack Container */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        {/* Stack visuals - Next cards peeking */}
        {[2, 1].map((offset) => {
          const index = (currentSectionIndex + offset) % SECTIONS.length;
          const section = SECTIONS[index];
          // Map section ID to DB field name
          const fieldName = section.id === 'professional' ? 'professional_recap' 
            : section.id === 'personal' ? 'personal_recap'
            : section.id === 'learning' ? 'learning_reflections'
            : 'gratitude';
            
          const hasContent = entryData[fieldName]?.trim().length > 0;
          
          // Alternating rotations to show corners
          const rotate = offset === 1 ? 2 : -1;
          const translateY = offset * 8;
          const scale = 1 - offset * 0.04;

          return (
            <div
              key={section.id}
              className="absolute w-[90%] md:w-full max-w-md bg-white rounded-3xl shadow-sm border border-journal-200 h-[70vh] transition-all duration-500 ease-in-out flex flex-col overflow-hidden"
              style={{
                zIndex: -offset,
                transform: `translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
                opacity: Math.max(0.4, 0.8 - offset * 0.2),
              }}
            >
              <div className="p-8 flex-1 flex flex-col opacity-20 pointer-events-none select-none">
                <h2 className="text-2xl font-serif font-bold text-journal-900 mb-2">
                  {section.title}
                </h2>
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
            className="absolute w-[90%] md:w-full max-w-md bg-white rounded-3xl shadow-xl border border-journal-200 flex flex-col min-h-[50vh] max-h-[85vh] h-auto z-10"
          >
            {/* Navigation Buttons Floating */}
            <div className="absolute top-6 right-6 z-20">
              <button 
                onClick={handleNext}
                className="bg-journal-900 text-white p-3 rounded-full shadow-lg shadow-journal-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                {currentSectionIndex === SECTIONS.length - 1 ? <Check size={20} /> : <ArrowRight size={20} />}
              </button>
            </div>
            
             {currentSectionIndex > 0 && (
                <div className="absolute top-6 left-6 z-20">
                  <button 
                    onClick={handlePrev}
                    className="bg-white border border-journal-100 text-journal-400 p-2 rounded-full shadow-sm hover:text-journal-900 hover:scale-105 active:scale-95 transition-all"
                  >
                    <ArrowLeft size={18} />
                  </button>
                </div>
             )}

            <div className="p-8 pt-16 flex-1 flex flex-col min-h-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-sm font-bold text-journal-300 uppercase tracking-widest">
                    {new Date(entryData.entry_date + 'T00:00:00').toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <h2 className="text-3xl font-serif font-bold text-journal-900 mb-2">
                {SECTIONS[currentSectionIndex].title}
              </h2>
              <p className="text-journal-500 text-base mb-6 leading-relaxed">
                {SECTIONS[currentSectionIndex].prompt}
              </p>
              
              <RichTextEditor
                value={(() => {
                   const section = SECTIONS[currentSectionIndex];
                   const fieldName = section.id === 'professional' ? 'professional_recap' 
                    : section.id === 'personal' ? 'personal_recap'
                    : section.id === 'learning' ? 'learning_reflections'
                    : 'gratitude';
                   return entryData[fieldName];
                })()}
                onChange={(newValue) => {
                   const section = SECTIONS[currentSectionIndex];
                   const fieldName = section.id === 'professional' ? 'professional_recap' 
                    : section.id === 'personal' ? 'personal_recap'
                    : section.id === 'learning' ? 'learning_reflections'
                    : 'gratitude';
                   setEntryData({ ...entryData, [fieldName]: newValue });
                }}
                placeholder="Type here..."
              />
              
              <div className="mt-4 text-xs text-journal-300 italic">
                {SECTIONS[currentSectionIndex].helper}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}