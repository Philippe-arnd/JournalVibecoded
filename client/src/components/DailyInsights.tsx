import React, { useState, useEffect } from 'react';
import { ArrowRight, X, Clock } from 'lucide-react';
import { INSIGHTS_LIBRARY } from '../data/insights';
import { getInsightIcon, getInsightTheme } from '../utils/insightUtils';

interface DailyInsightsProps {
  onComplete: () => void; // Function to call when insights are done
}

interface Insight {
  text: string;
  type: string;
}

export default function DailyInsights({ onComplete }: DailyInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); // 30s timer for the last slide
  const [animKey, setAnimKey] = useState(0);

  // 1. Select 3 Random Insights on Mount
  useEffect(() => {
    const shuffled = [...INSIGHTS_LIBRARY].sort(() => 0.5 - Math.random());
    setInsights(shuffled.slice(0, 3));
  }, []);

  // 2. Handle 30s Timer for the LAST slide only
  useEffect(() => {
    if (currentIndex === 2) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentIndex, onComplete]);

  // Trigger animation on slide change
  useEffect(() => {
    setAnimKey((prev) => prev + 1);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < 2) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  if (insights.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-paper flex flex-col items-center justify-center p-6 text-center">
      
      {/* Top Bar */}
      <div className="absolute top-6 right-6">
        <button 
          onClick={onComplete}
          className="text-subtle hover:text-ink transition-colors flex items-center gap-2 text-sm font-medium"
        >
          Skip <X size={16} />
        </button>
      </div>

      {/* Progress Indicators */}
      <div className="flex gap-2 mb-12">
        {[0, 1, 2].map((idx) => (
          <div 
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              idx === currentIndex ? 'w-8 bg-accent' : 'w-2 bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Main Content Area */}
      <div key={animKey} className="max-w-xl w-full animate-slide-up">
        <div className="mb-6 flex flex-col items-center">
          {(() => {
            const theme = getInsightTheme(insights[currentIndex].type);
            return (
              <>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${theme.bg} ${theme.color}`}>
                   {getInsightIcon(insights[currentIndex].type, 24)}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.color}`}>
                  {theme.label}
                </span>
              </>
            );
          })()}
        </div>

        <h2 className="text-3xl md:text-4xl font-serif font-bold text-ink mb-8 leading-tight">
          "{insights[currentIndex].text}"
        </h2>

        {/* Footer Actions */}
        <div className="mt-12 flex flex-col items-center gap-4">
          
          <button
            onClick={handleNext}
            className="group flex items-center gap-3 bg-ink hover:bg-black text-white px-8 py-3 rounded-full font-medium transition-all hover:scale-105"
          >
            {currentIndex === 2 ? 'Start Journaling' : 'Next Insight'}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Countdown for Last Slide */}
          {currentIndex === 2 && (
            <div className="text-sm text-subtle flex items-center gap-1 animate-pulse">
              <Clock size={14} />
              <span>Auto-closing in {timeLeft}s</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

        <h2 className="text-3xl md:text-4xl font-serif font-bold text-ink mb-8 leading-tight">
          "{insights[currentIndex].text}"
        </h2>

        {/* Footer Actions */}
        <div className="mt-12 flex flex-col items-center gap-4">
          
          <button
            onClick={handleNext}
            className="group flex items-center gap-3 bg-ink hover:bg-black text-white px-8 py-3 rounded-full font-medium transition-all hover:scale-105"
          >
            {currentIndex === 2 ? 'Start Journaling' : 'Next Insight'}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Countdown for Last Slide */}
          {currentIndex === 2 && (
            <div className="text-sm text-subtle flex items-center gap-1 animate-pulse">
              <Clock size={14} />
              <span>Auto-closing in {timeLeft}s</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}