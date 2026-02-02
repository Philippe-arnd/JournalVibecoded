import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsOfServiceView() {
  return (
    <div className="min-h-screen bg-journal-50 text-journal-900 font-sans p-6 md:p-12">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-16 rounded-2xl shadow-sm border border-journal-200">
        <Link to="/" className="inline-flex items-center gap-2 text-journal-500 hover:text-journal-900 mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
            <FileText size={32} className="text-journal-accent" />
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-journal-900">Terms of Service</h1>
        </div>
        
        <div className="prose prose-journal max-w-none text-journal-800/80">
            <p className="text-lg leading-relaxed mb-6">
                By using Journal App, you agree to the following terms and conditions.
            </p>

            <h2 className="text-xl font-bold text-journal-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
                By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
            </p>

            <h2 className="text-xl font-bold text-journal-900 mt-8 mb-4">2. User Accounts</h2>
            <p className="mb-4">
                You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.
            </p>

            <h2 className="text-xl font-bold text-journal-900 mt-8 mb-4">3. Content</h2>
            <p className="mb-4">
                You retain all rights to the content you create in your journal. We claim no intellectual property rights over the material you provide to the service.
            </p>
            
            <h2 className="text-xl font-bold text-journal-900 mt-8 mb-4">4. Prohibited Uses</h2>
            <p className="mb-6">
                You may not use the service for any illegal purpose or to solicit the performance of any illegal activity.
            </p>

             <h2 className="text-xl font-bold text-journal-900 mt-8 mb-4">5. Disclaimer</h2>
             <p className="mb-6">
                The service is provided on an "AS IS" and "AS AVAILABLE" basis.
             </p>

            <h2 className="text-xl font-bold text-journal-900 mt-8 mb-4">6. Changes</h2>
            <p>
                We reserve the right to modify or replace these Terms at any time.
            </p>
        </div>
        
        <div className="mt-12 pt-8 border-t border-journal-100 text-sm text-journal-500">
            Last Updated: January 2026
        </div>
      </div>
    </div>
  );
}
