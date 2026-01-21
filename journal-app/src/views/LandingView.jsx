import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Brain, Feather } from 'lucide-react';

export default function LandingView() {
  return (
    <div className="min-h-screen bg-paper text-ink font-sans selection:bg-accent/20">
      
      {/* Navigation */}
      <nav className="p-6 max-w-6xl mx-auto flex justify-between items-center">
        <div className="font-serif font-bold text-xl tracking-tight flex items-center gap-2">
          <Feather size={20} className="text-accent" />
          Journal.
        </div>
        <div className="flex gap-4 items-center">
          <Link to="/login" className="text-subtle hover:text-ink font-medium text-sm transition-colors">
            Log in
          </Link>
          <Link 
            to="/signup" 
            className="bg-ink text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-black transition-transform hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
        
        <div className="inline-flex items-center gap-2 bg-white border border-border px-4 py-1.5 rounded-full text-sm text-subtle mb-8 animate-fade-in">
          <Sparkles size={14} className="text-accent" />
          <span>Now with AI-Powered Insights</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8 leading-[1.1] tracking-tight animate-slide-up">
          The journal that <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-600">
            thinks with you.
          </span>
        </h1>
        
        <p className="text-xl text-subtle max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Stop staring at a blank page. Experience a guided 4-step flow designed for growth, clarity, and peace of mind.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Link 
            to="/signup" 
            className="flex items-center gap-2 bg-accent text-white px-8 py-4 rounded-xl font-medium text-lg hover:brightness-110 transition-all shadow-lg shadow-accent/20 w-full sm:w-auto justify-center"
          >
            Start Journaling <ArrowRight size={20} />
          </Link>
          <Link 
            to="/login"
            className="flex items-center gap-2 bg-white border border-border text-ink px-8 py-4 rounded-xl font-medium text-lg hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center"
          >
            Sign In
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32 text-left">
          <FeatureCard 
            icon={<Brain className="text-accent" />}
            title="Guided Reflection"
            desc="No more writer's block. Answer 4 simple prompts to structure your day."
          />
          <FeatureCard 
            icon={<Sparkles className="text-purple-500" />}
            title="Daily Wisdom"
            desc="Start every session with a curated insight to spark your thinking."
          />
          <FeatureCard 
            icon={<Shield className="text-green-600" />}
            title="Private & Secure"
            desc="Your thoughts are yours alone. Encrypted and safe."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-12 text-center text-subtle text-sm">
        <p>&copy; {new Date().getFullYear()} Journal App. Built with Vibe Coding.</p>
      </footer>
    </div>
  );
}

// Helper Component for Cards
function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4 bg-paper w-12 h-12 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-serif font-bold mb-2 text-ink">{title}</h3>
      <p className="text-subtle leading-relaxed">{desc}</p>
    </div>
  );
}