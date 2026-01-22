import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Brain, Feather, CheckCircle2, Lock, Layout, Star, Github, Calendar, ChevronDown } from 'lucide-react';
import Logo from '../components/Logo';

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function LandingView() {
  return (
    <div className="min-h-screen bg-journal-50 text-journal-900 font-sans selection:bg-journal-accent/20 overflow-x-hidden">
      
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 w-full bg-journal-50/80 backdrop-blur-md z-50 border-b border-journal-200"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo size={28} />
            <span className="font-serif font-bold text-xl tracking-tight text-journal-900">Journal.</span>
          </div>
          <div className="flex gap-4 items-center">
            <Link to="/login" className="text-journal-800 hover:text-journal-900 font-medium text-sm transition-colors">
              Log in
            </Link>
            <Link 
              to="/signup" 
              className="bg-journal-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-black transition-transform hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 relative overflow-hidden">
         {/* Simple background blobs */}
         <div className="absolute top-20 left-10 w-64 h-64 bg-green-100/50 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '4s' }}></div>
         <div className="absolute top-40 right-10 w-72 h-72 bg-orange-100/50 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '5s' }}></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-white border border-journal-200 px-4 py-1.5 rounded-full text-sm text-journal-800 mb-8 shadow-sm hover:shadow-md transition-shadow">
              <Sparkles size={14} className="text-journal-accent" />
              <span className="font-medium">Now with AI Coaching & Insights</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-serif font-bold mb-8 leading-[1.1] tracking-tight text-journal-900">
              Your mind, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-journal-accent to-orange-600">
                clearer than ever.
              </span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-xl text-journal-800/80 max-w-2xl mx-auto mb-10 leading-relaxed">
              Stop staring at a blank page. Experience a guided 4-step flow designed to help you reflect, learn, and grow—in under 5 minutes a day.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link 
                to="/signup" 
                className="flex items-center gap-2 bg-journal-accent text-white px-8 py-4 rounded-xl font-medium text-lg hover:brightness-110 transition-all shadow-lg shadow-journal-accent/20 w-full sm:w-auto justify-center"
              >
                Start Writing Free <ArrowRight size={20} />
              </Link>
              <Link 
                to="/login"
                className="flex items-center gap-2 bg-white border border-journal-200 text-journal-900 px-8 py-4 rounded-xl font-medium text-lg hover:bg-journal-100 transition-colors w-full sm:w-auto justify-center"
              >
                Sign In
              </Link>
            </motion.div>
          </motion.div>

          {/* App Preview Mockup - Timeline Style */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative mx-auto max-w-4xl"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-journal-accent to-purple-600 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-white border border-journal-200 rounded-2xl shadow-2xl overflow-hidden aspect-[16/10] md:aspect-[16/9] flex flex-col">
              
              {/* Mock Browser Header */}
              <div className="h-10 bg-journal-50 border-b border-journal-200 flex items-center px-4 justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="h-5 w-64 bg-white border border-journal-200 rounded flex items-center justify-center text-[10px] text-journal-800/50 font-mono">
                    journal.app/timeline
                </div>
                <div className="w-4"></div>
              </div>

              {/* Mock Application Interface */}
              <div className="flex-1 flex overflow-hidden bg-journal-50">
                
                {/* Sidebar (Mock) */}
                <div className="w-16 border-r border-journal-200 hidden md:flex flex-col items-center py-6 gap-6 bg-white">
                    <div className="w-8 h-8 bg-journal-900 rounded-lg flex items-center justify-center text-white"><Feather size={16} /></div>
                    <div className="w-8 h-8 hover:bg-journal-100 rounded-lg flex items-center justify-center text-journal-400"><Calendar size={18} /></div>
                    <div className="w-8 h-8 hover:bg-journal-100 rounded-lg flex items-center justify-center text-journal-400"><Brain size={18} /></div>
                </div>

                {/* Main Timeline Content */}
                <div className="flex-1 p-6 md:p-10 overflow-hidden relative">
                    
                    {/* Header */}
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h3 className="text-2xl font-serif font-bold text-journal-900">Your Timeline</h3>
                            <p className="text-sm text-journal-800/60">Thursday, Jan 22</p>
                        </div>
                        <div className="bg-white border border-journal-200 px-3 py-1 rounded-full text-xs font-medium text-journal-800 shadow-sm flex items-center gap-1">
                             <Sparkles size={10} className="text-journal-accent"/> 12 Day Streak
                        </div>
                    </div>

                    {/* Timeline Line */}
                    <div className="absolute left-10 md:left-20 top-24 bottom-0 w-px bg-journal-200"></div>

                    {/* Timeline Entries */}
                    <div className="space-y-6 relative">

                        {/* Entry 1 (Active/Today) */}
                        <div className="flex gap-4 md:gap-6">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-journal-accent border-4 border-journal-50 shadow-sm flex items-center justify-center relative z-10 mt-1">
                                <Feather size={14} className="text-white" />
                            </div>
                            <div className="flex-1 bg-white p-5 rounded-xl border border-journal-200 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-bold text-journal-900">Daily Reflection</h4>
                                    <span className="text-xs text-journal-400">10:42 AM</span>
                                </div>
                                <div className="space-y-2 mb-4">
                                    {/* Abstract representations of the 4 sections */}
                                    <div className="h-2 bg-teal-100 rounded w-full overflow-hidden">
                                        <div className="h-full bg-teal-500 w-3/4"></div>
                                    </div>
                                    <div className="h-2 bg-orange-100 rounded w-full overflow-hidden">
                                        <div className="h-full bg-orange-400 w-1/2"></div>
                                    </div>
                                    <div className="h-2 bg-blue-100 rounded w-full overflow-hidden">
                                        <div className="h-full bg-blue-400 w-2/3"></div>
                                    </div>
                                </div>
                                {/* AI Insight Box */}
                                <div className="bg-journal-50 rounded-lg p-3 border border-journal-100 flex gap-3">
                                    <Sparkles size={16} className="text-journal-accent flex-shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-journal-900 uppercase">AI Pattern Spotter</p>
                                        <p className="text-sm text-journal-800/80 leading-snug">
                                            "You've mentioned <strong>'morning walks'</strong> in 5 of your last 7 entries. This seems to be a key driver for your productivity."
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Entry 2 (Yesterday - Muted) */}
                        <div className="flex gap-4 md:gap-6 opacity-60">
                             <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-journal-300 flex items-center justify-center relative z-10 mt-1">
                                <span className="text-[10px] font-bold text-journal-500">21</span>
                            </div>
                             <div className="flex-1 bg-white p-4 rounded-xl border border-journal-200">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium text-journal-900">Wednesday Recap</h4>
                                    <ChevronDown size={16} className="text-journal-400" />
                                </div>
                             </div>
                        </div>

                         {/* Entry 3 (Previous - Muted) */}
                        <div className="flex gap-4 md:gap-6 opacity-40">
                             <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-journal-300 flex items-center justify-center relative z-10 mt-1">
                                <span className="text-[10px] font-bold text-journal-500">20</span>
                            </div>
                             <div className="flex-1 bg-white p-4 rounded-xl border border-journal-200">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium text-journal-900">Tuesday Recap</h4>
                                </div>
                             </div>
                        </div>

                    </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      {/* Value Proposition / Features */}
      <section className="py-24 bg-white border-y border-journal-200 relative overflow-hidden">
         <div className="absolute top-1/2 left-0 w-96 h-96 bg-journal-100/50 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 opacity-50"></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-journal-900 mb-4">
              More than just a diary.
            </h2>
            <p className="text-lg text-journal-800/70 max-w-2xl mx-auto">
              A complete system for mental clarity, combining structured reflection with intelligent feedback.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Layout className="text-journal-accent" />}
              title="Guided 4-Step Flow"
              desc="Professional, Personal, Learning, and Gratitude. A proven framework to capture what matters in minutes."
            />
            <FeatureCard 
              icon={<Brain className="text-purple-500" />}
              title="AI Pattern Recognition"
              desc="After 7 entries, our AI connects the dots, surfacing trends in your mood and productivity you might miss."
            />
            <FeatureCard 
              icon={<Lock className="text-teal-600" />}
              title="Private & Encrypted"
              desc="Your thoughts are yours alone. We use industry-standard encryption to keep your data safe."
            />
          </div>
        </div>
      </section>

      {/* How it Works / The Flow */}
      <section className="py-24 bg-journal-50">
        <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-16">
                <div className="flex-1 space-y-8">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-journal-900 leading-tight">
                        Turn chaos into clarity <br/> in 5 minutes a day.
                    </h2>
                    <p className="text-lg text-journal-800/80">
                        Most journaling apps leave you staring at a blank screen. We guide you through four specific sections to ensure a balanced reflection.
                    </p>
                    
                    <div className="space-y-6">
                        <StepItem number="1" title="Professional Recap" desc="What did you achieve? What blocked you?" />
                        <StepItem number="2" title="Personal Wins" desc="How did you recharge? Who did you connect with?" />
                        <StepItem number="3" title="Learning" desc="One thing you learned today." />
                        <StepItem number="4" title="Gratitude" desc="Three things that brought you joy." />
                    </div>
                </div>
                
                <div className="flex-1 bg-white p-8 rounded-3xl border border-journal-200 shadow-xl rotate-1 hover:rotate-0 transition-transform duration-500">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 border-b border-journal-100 pb-4">
                            <div className="w-10 h-10 bg-journal-100 rounded-full flex items-center justify-center text-journal-500">
                                <Feather size={20} />
                            </div>
                            <div>
                                <h4 className="font-serif font-bold text-journal-900">Today's Entry</h4>
                                <p className="text-xs text-journal-800/60">{new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-bold text-journal-900 uppercase tracking-wider">Professional</p>
                            <p className="text-journal-800/80 italic">"Finally shipped the new landing page design..."</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-bold text-journal-900 uppercase tracking-wider">Gratitude</p>
                            <ul className="text-journal-800/80 space-y-1 list-disc list-inside">
                                <li>Morning coffee</li>
                                <li>Team support</li>
                                <li>Walking the dog</li>
                            </ul>
                        </div>
                        <div className="mt-6 bg-journal-50 p-4 rounded-xl border border-journal-200">
                             <div className="flex items-center gap-2 mb-2 text-journal-accent">
                                <Sparkles size={16} />
                                <span className="text-xs font-bold uppercase">AI Coach</span>
                            </div>
                            <p className="text-sm text-journal-800">
                                "Great job shipping that design! I noticed you often feel most accomplished when you finish visual tasks."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-journal-900 text-white relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-journal-accent/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <Star className="w-12 h-12 text-journal-accent mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Start your habit today.
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join thousands of mindful achievers who have replaced "busy" with "meaningful".
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <Link 
                to="/signup" 
                className="bg-journal-accent text-white px-10 py-4 rounded-full font-bold text-lg hover:brightness-110 transition-all shadow-lg shadow-journal-accent/30"
              >
                Get Started for Free
              </Link>
          </div>
          <p className="mt-6 text-sm text-gray-400">No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-journal-50 border-t border-journal-200 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-2">
            <Logo size={24} />
            <span className="font-serif font-bold text-journal-900">Journal.</span>
          </div>
          
          <div className="flex items-center gap-4">
             <p className="text-journal-800/60 text-sm">
               &copy; {new Date().getFullYear()} Journal App. Built with Vibe Coding.
             </p>
             <a 
                href="https://github.com/Philippe-arnd/JournalVibecoded" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-journal-800/60 hover:text-journal-900 transition-colors"
                aria-label="GitHub Repository"
             >
                <Github size={20} />
             </a>
          </div>

          <div className="flex gap-6 text-sm font-medium text-journal-800/80">
            <Link to="/privacy" className="hover:text-journal-900">Privacy</Link>
            <Link to="/terms" className="hover:text-journal-900">Terms</Link>
            <a href="https://github.com/Philippe-arnd/JournalVibecoded/issues" target="_blank" rel="noopener noreferrer" className="hover:text-journal-900">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper Component for Feature Cards
function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-journal-50 p-8 rounded-2xl border border-journal-200 hover:border-journal-300 transition-colors"
    >
      <div className="mb-6 bg-white w-14 h-14 rounded-xl flex items-center justify-center shadow-sm border border-journal-100">
        {icon}
      </div>
      <h3 className="text-xl font-serif font-bold mb-3 text-journal-900">{title}</h3>
      <p className="text-journal-800/70 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

// Helper Component for Step Items
function StepItem({ number, title, desc }) {
    return (
        <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-journal-200 text-journal-900 font-bold flex items-center justify-center text-sm">
                {number}
            </div>
            <div>
                <h3 className="font-bold text-journal-900 text-lg">{title}</h3>
                <p className="text-journal-800/70">{desc}</p>
            </div>
        </div>
    )
}