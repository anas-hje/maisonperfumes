'use client';

import { useEffect } from 'react';

// Catches errors thrown by the root layout itself (fonts, providers, etc.) — this is
// the last line of defense and must render its own <html>/<body> since it replaces
// the entire root layout when triggered.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[global error boundary]', error);
  }, [error]);

  return (
    <html lang="fr">
      <body style={{ fontFamily: 'sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            background: '#FAFAF8',
            color: '#2D2A26',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Une erreur est survenue</h1>
            <p style={{ marginBottom: '2rem', opacity: 0.7 }}>
              Veuillez recharger la page. Si le problème persiste, contactez-nous.
            </p>
            <button
              onClick={reset}
              style={{
                background: '#B8860B',
                color: '#FAFAF8',
                border: 'none',
                padding: '0.75rem 2rem',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Réessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
