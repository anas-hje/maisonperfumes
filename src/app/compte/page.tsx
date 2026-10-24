import type { Metadata } from 'next';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Mon compte',
  description: 'Suivez vos commandes Maison.',
  robots: { index: false, follow: true },
};

// Customer accounts don't exist yet. This page previously showed a login form that
// accepted any email/password and then listed every order in the browser's local
// storage — a sign-in that authenticated nobody. Rather than keep a fake login,
// it now points customers at order tracking, which verifies the order reference
// against the phone number it was placed with.
export default function AccountPage() {
  return (
    <div className="min-h-screen bg-graphite text-quartz font-sans pt-32 pb-24">
      <div className="max-w-xl mx-auto px-6 text-center">
        <h1 className="font-display text-4xl text-light uppercase tracking-widest mb-6">
          Mon compte
        </h1>

        <p className="text-quartz/70 font-light mb-4">
          Pas besoin de créer un compte pour commander chez Maison : vos achats se font
          en quelques clics, et le paiement s&apos;effectue à la livraison.
        </p>

        <p className="text-quartz/70 font-light mb-10">
          Pour consulter une commande, utilisez votre numéro de commande et le téléphone
          indiqué lors de l&apos;achat.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/suivi-commande">
            <Button className="w-full sm:w-auto bg-amber hover:bg-brass text-graphite border-none rounded-none uppercase tracking-widest px-8">
              Suivre ma commande
            </Button>
          </Link>
          <Link href="/categorie/parfums">
            <Button
              variant="secondary"
              className="w-full sm:w-auto rounded-none uppercase tracking-widest px-8"
            >
              Découvrir la collection
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
