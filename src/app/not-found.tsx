import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-24 bg-graphite text-quartz font-sans">
      <div className="text-center max-w-md">
        <p className="font-display text-6xl text-light mb-4">404</p>
        <h1 className="font-display text-2xl text-light uppercase tracking-widest mb-4">
          Page introuvable
        </h1>
        <p className="text-quartz/70 font-light mb-8">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link href="/">
          <Button className="bg-amber hover:bg-brass text-graphite border-none rounded-none uppercase tracking-widest px-8">
            Retour à l&apos;accueil
          </Button>
        </Link>
      </div>
    </div>
  );
}
