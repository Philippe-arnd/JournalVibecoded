import React from 'react';
import { Brain, Zap, Wind, Heart, TrendingUp, Sparkles, Lightbulb } from 'lucide-react';

export const getInsightIcon = (type, size = 24, className = "") => {
  const props = { size, className };
  switch (type) {
    case 'stoicism': return <Brain {...props} />;
    case 'productivity': return <Zap {...props} />;
    case 'mindfulness': return <Wind {...props} />;
    case 'health': return <Heart {...props} />;
    case 'growth': return <TrendingUp {...props} />;
    case 'ai': return <Sparkles {...props} />;
    default: return <Lightbulb {...props} />;
  }
};

export const getInsightTheme = (type) => {
  switch (type) {
    case 'stoicism': return { label: "Stoicism & Mindset", color: "text-blue-500", bg: "bg-blue-50" };
    case 'productivity': return { label: "Productivity & Focus", color: "text-yellow-500", bg: "bg-yellow-50" };
    case 'mindfulness': return { label: "Mindfulness & Presence", color: "text-teal-500", bg: "bg-teal-50" };
    case 'health': return { label: "Health & Vitality", color: "text-red-500", bg: "bg-red-50" };
    case 'growth': return { label: "Coaching & Growth", color: "text-emerald-500", bg: "bg-emerald-50" };
    case 'ai': return { label: "AI Insight", color: "text-purple-600", bg: "bg-purple-50" };
    default: return { label: "Advice", color: "text-amber-500", bg: "bg-amber-50" };
  }
};
