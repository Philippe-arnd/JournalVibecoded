import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicyView() {
  return (
    <div className="min-h-screen bg-journal-50 text-journal-900 font-sans p-6 md:p-12">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-16 rounded-2xl shadow-sm border border-journal-200">
        <Link to="/" className="inline-flex items-center gap-2 text-journal-500 hover:text-journal-900 mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
            <Shield size={32} className="text-journal-accent" />
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-journal-900">Privacy Policy</h1>
        </div>
        
        <div className="prose prose-journal max-w-none text-journal-800/80">
            <p className="text-lg leading-relaxed mb-6">
                Your privacy is our top priority. This document outlines how Journal App collects, uses, and protects your data.
            </p>

            <h2 className="text-xl font-bold text-journal-900 mt-8 mb-4">1. Data Collection</h2>
            <p className="mb-4">
                We only collect the data necessary to provide you with the journaling service. This includes:
            </p>
            <ul className="list-disc pl-5 mb-6 space-y-2">
                <li>Account information (email address)</li>
                <li>Journal entries (text content)</li>
                <li>Usage statistics (streaks, feature usage)</li>
            </ul>

            <h2 className="text-xl font-bold text-journal-900 mt-8 mb-4">2. Data Usage</h2>
            <p className="mb-4">
                We use your data strictly to:
            </p>
            <ul className="list-disc pl-5 mb-6 space-y-2">
                <li>Store and retrieve your journal entries across devices.</li>
                <li>Provide AI-powered insights (your data is processed but not used to train public models).</li>
                <li>Improve application performance.</li>
            </ul>

            <h2 className="text-xl font-bold text-journal-900 mt-8 mb-4">3. Data Security</h2>
            <p className="mb-4">
                All data is encrypted in transit (via HTTPS) and at rest. We use secure cloud storage. We do not sell your personal data to third parties.
            </p>

            <h2 className="text-xl font-bold text-journal-900 mt-8 mb-4">4. Your Rights</h2>
            <p className="mb-6">
                You have the right to request a copy of your data or request deletion of your account and all associated data at any time.
            </p>

             <h2 className="text-xl font-bold text-journal-900 mt-8 mb-4">5. Contact Us</h2>
             <p>
                If you have any questions about this policy, please contact us via our GitHub repository.
             </p>
        </div>
        
        <div className="mt-12 pt-8 border-t border-journal-100 text-sm text-journal-500">
            Last Updated: January 2026
        </div>
      </div>
    </div>
  );
}
