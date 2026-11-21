import React from 'react';
import { reportError } from '../observability';

// Last-resort guard: a render error anywhere below shows this fallback instead of a blank page,
// and is reported to RUM (component stack only, no user content).
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    reportError(error, { react: { componentStack: info?.componentStack?.slice(0, 2000) } });
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-journal-50 px-4 text-center">
        <p className="text-journal-900 text-lg font-semibold">Une erreur inattendue est survenue.</p>
        <p className="text-journal-500 text-sm">Vos entrées ne sont pas perdues. Rechargez la page pour continuer.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-journal-900 px-4 py-2 text-white"
        >
          Recharger
        </button>
      </div>
    );
  }
}
