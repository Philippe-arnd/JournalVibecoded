import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ArrowRight, Check } from 'lucide-react';
import { INSIGHTS_LIBRARY } from '../data/insights';

export default function DailysInsights() {
  const [insightsStack, setInsightsStack] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    // Shuffle and pick 3 insights for the session
    const shuffled = [...INSIGHTS_LIBRARY].sort(() => 0.5 - Math.random());
    setInsightsStack(shuffled.slice(0, 3));
  }, []);

  useEffect(() => {
    let timer;
    // If we are at the last card
    if (insightsStack.length > 0 && currentIndex === insightsStack.length - 1) {
      timer = setTimeout(() => {
        handleNext();
      }, 30000);
    }
    return () => clearTimeout(timer);
  }, [currentIndex, insightsStack.length]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex(prev => prev + 1);
  };

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

  const isFinished = currentIndex >= insightsStack.length;

  return (
    <div className="max-w-xl mx-auto pb-20">
      <div className="relative h-[500px] w-full flex items-center justify-center mb-12">
        {/* Stack visuals - Next cards peeking */}
        {!isFinished && [2, 1].map((offset) => {
          const index = currentIndex + offset;
          if (index >= insightsStack.length) return null;
          
          const rotate = offset % 2 === 0 ? -2 : 2;
          const translateY = offset * 8;
          const scale = 1 - offset * 0.05;

          return (
            <div
              key={index}
              className="absolute w-full bg-white rounded-3xl shadow-sm border border-journal-100 h-full transition-all duration-500 ease-in-out flex flex-col overflow-hidden"
              style={{
                zIndex: -offset,
                transform: `translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
                opacity: Math.max(0.5, 1 - offset * 0.15),
              }}
            >
               <div className="absolute -top-4 -right-4 text-journal-50 opacity-50">
                  <Quote size={120} />
                </div>
            </div>
          );
        })}

        <AnimatePresence initial={false} custom={direction}>
          {!isFinished && (
            <motion.div
              key={currentIndex}
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
                }
              }}
              className="absolute w-full bg-white rounded-3xl shadow-xl border border-journal-100 h-full z-10 overflow-hidden cursor-grab active:cursor-grabbing"
            >
              <div className="absolute -top-4 -right-4 text-journal-50 opacity-50">
                <Quote size={120} />
              </div>
              
              <div className="relative z-10 flex flex-col h-full p-8">
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-xl md:text-2xl font-serif text-journal-900 leading-relaxed italic text-center">
                    "{insightsStack[currentIndex]}"
                  </p>
                </div>
                
                <div className="flex justify-center mt-auto pt-6">
                  <button 
                    onClick={handleNext}
                    className="bg-journal-900 text-white p-4 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
                  >
                    <ArrowRight size={24} />
                  </button>
                </div>
                
                {currentIndex === insightsStack.length - 1 && (
                   <div className="absolute bottom-0 left-0 right-0 h-1 bg-journal-100">
                     <motion.div 
                       initial={{ width: "0%" }}
                       animate={{ width: "100%" }}
                       transition={{ duration: 30, ease: "linear" }}
                       className="h-full bg-journal-200"
                     />
                   </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {isFinished && (
           <div className="flex flex-col items-center justify-center h-full text-journal-400">
              <Check size={48} className="mb-4 text-journal-200" />
              <p>That's all for the moment.</p>
           </div>
        )}
      </div>
    </div>
  );
}