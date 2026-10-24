'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Replace with a real error-tracking service (e.g. Sentry) before launch —
    // see MAISON_DEPLOYMENT_GUIDE.md. Never surface `error.message`/stack to the user.
    console.error('[app error boundary]', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-24 bg-graphite text-quartz font-sans">
      <div className="text-center max-w-md">
        <h1 className="font-display text-2xl text-light uppercase tracking-widest mb-4">
          Une erreur est survenue
        </h1>
        <p className="text-quartz/70 font-light mb-8">
          Quelque chose s&apos;est mal passé de notre côté. Veuillez réessayer.
        </p>
        <Button
          onClick={reset}
          className="bg-amber hover:bg-brass text-graphite border-none rounded-none uppercase tracking-widest px-8"
        >
          Réessayer
        </Button>
      </div>
    </div>
  );
}
