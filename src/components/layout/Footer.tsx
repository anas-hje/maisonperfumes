'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAdminSettingsStore } from '@/lib/store/admin-settings';

const NAVIGATION = [
  { href: '/nouveautes', label: 'Nouveautés' },
  { href: '/bestsellers', label: 'Bestsellers' },
  { href: '/boutiques', label: 'Nos Boutiques' },
  { href: '/cadeaux', label: 'Idées Cadeaux' },
];

const CATEGORIES = [
  { href: '/categorie/parfums', label: 'Parfums' },
  { href: '/categorie/cosmetiques', label: 'Cosmétiques' },
  { href: '/categorie/soin-visage', label: 'Soin Visage' },
  { href: '/categorie/corps-et-bain', label: 'Corps & Bain' },
  { href: '/categorie/cheveux', label: 'Cheveux' },
];

const SERVICE = [
  { href: '/contact', label: 'Contactez-nous' },
  { href: '/livraison', label: 'Livraison & Retours' },
  { href: '/faq', label: 'FAQ' },
  { href: '/suivi-commande', label: 'Suivi de Commande' },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <nav aria-labelledby={`footer-${title}`}>
      <h3
        id={`footer-${title}`}
        className="text-[11px] uppercase tracking-[0.3em] text-quartz/70 mb-5"
      >
        {title}
      </h3>
      <ul className="space-y-3 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group inline-flex items-center gap-2 text-quartz hover:text-light transition-colors focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2"
            >
              <span className="h-px w-0 bg-amber transition-all duration-300 group-hover:w-3.5" aria-hidden="true" />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Footer() {
  const storeName = useAdminSettingsStore((s) => s.storeName);
  const contactEmail = useAdminSettingsStore((s) => s.contactEmail);
  const contactPhone = useAdminSettingsStore((s) => s.contactPhone);
  const socialLinks = useAdminSettingsStore((s) => s.socialLinks);
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Not wired to an email provider yet — see README "Still outstanding".
    toast.success('Merci pour votre inscription à notre newsletter !');
    setEmail('');
  };

  const whatsappClean = socialLinks?.whatsapp?.replace(/[\s-]/g, '') || '';
  const whatsappUrl = whatsappClean ? `https://wa.me/${whatsappClean}` : null;
  const instagramUrl = socialLinks?.instagram
    ? `https://instagram.com/${socialLinks.instagram.replace(/^@/, '')}`
    : null;
  const facebookUrl = socialLinks?.facebook
    ? `https://facebook.com/${socialLinks.facebook.replace(/^@/, '')}`
    : null;

  const socials = [
    {
      url: instagramUrl,
      label: 'Instagram',
      path: (
        <>
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </>
      ),
    },
    {
      url: facebookUrl,
      label: 'Facebook',
      path: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
    },
  ].filter((s) => s.url);

  return (
    <footer className="relative mt-24 border-t border-white/10 bg-obsidian text-quartz">
      {/* Hairline that catches the light, echoing the panel treatment elsewhere. */}
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber/40 to-transparent"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-10">
        {/* ── Newsletter ───────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl panel-edge px-6 py-12 md:px-12 text-center mb-20">
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[36rem] -translate-x-1/2 rounded-full bg-iris/20 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative">
            <h2 className="font-display text-3xl md:text-4xl text-light mb-3 tracking-wide">
              Rejoignez notre newsletter
            </h2>
            <p className="text-sm text-quartz mb-8 max-w-md mx-auto">
              Nouveautés, éditions limitées et offres réservées — directement dans votre boîte mail.
            </p>

            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Votre adresse email
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse email"
                required
                className="flex-1 rounded-full bg-white/5 border border-white/12 px-5 py-3 text-light placeholder:text-quartz/60 focus:outline-none focus:border-amber/60 transition-colors"
              />
              <button
                type="submit"
                className="rounded-full bg-gradient-to-b from-amber to-[#C08F32] text-graphite px-8 py-3 text-sm uppercase tracking-[0.18em] font-medium transition-all hover:shadow-[0_14px_42px_-10px_rgba(217,164,65,0.75)] focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2"
              >
                S&apos;inscrire
              </button>
            </form>
          </div>
        </div>

        {/* ── Columns ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          <div className="col-span-2 lg:col-span-2">
            <Link
              href="/"
              className="font-display text-2xl tracking-[0.34em] text-light uppercase focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2"
            >
              {storeName || 'Maison'}
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-quartz max-w-sm">
              {storeName || 'Maison'} incarne l&apos;excellence de la parfumerie marocaine,
              alliant tradition séculaire et innovation contemporaine.
            </p>

            <div className="mt-6 space-y-1.5 text-sm">
              {contactEmail && (
                <p>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-quartz hover:text-amber transition-colors"
                  >
                    {contactEmail}
                  </a>
                </p>
              )}
              {contactPhone && (
                <p>
                  <a
                    href={`tel:${contactPhone.replace(/[\s-]/g, '')}`}
                    className="text-quartz hover:text-amber transition-colors"
                  >
                    {contactPhone}
                  </a>
                </p>
              )}
            </div>

            {/* Social icons render only when a handle is configured, rather than the
                dead href="#" placeholders that used to sit here. */}
            {(socials.length > 0 || whatsappUrl) && (
              <div className="mt-7 flex gap-3">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="grid h-10 w-10 place-items-center rounded-full glass-surface text-quartz hover:text-amber hover:border-amber/40 transition-colors focus-visible:outline-2 focus-visible:outline-amber"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      {social.path}
                    </svg>
                  </a>
                ))}
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="grid h-10 w-10 place-items-center rounded-full glass-surface text-quartz hover:text-amber hover:border-amber/40 transition-colors focus-visible:outline-2 focus-visible:outline-amber"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          <FooterColumn title="Navigation" links={NAVIGATION} />
          <FooterColumn title="Catégories" links={CATEGORIES} />
          <FooterColumn title="Service Client" links={SERVICE} />
        </div>

        {/* ── Bottom bar ───────────────────────────────────────────── */}
        <div className="mt-16 pt-8 border-t border-white/8 flex flex-col-reverse md:flex-row items-center justify-between gap-5">
          <p className="text-xs text-quartz/70 text-center md:text-left">
            © {new Date().getFullYear()} {storeName || 'Maison'}. Tous droits réservés.
          </p>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-amber/25 bg-amber/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-amber">
              Paiement à la livraison
            </span>
            <svg className="h-6 w-10 opacity-60" viewBox="0 0 38 24" fill="none" aria-hidden="true">
              <rect width="38" height="24" rx="3" fill="#1A1A22" stroke="rgba(255,255,255,0.12)" />
              <circle cx="15" cy="12" r="5" fill="#EB001B" />
              <circle cx="23" cy="12" r="5" fill="#F79E1B" />
            </svg>
            <svg className="h-6 w-10 opacity-60" viewBox="0 0 38 24" fill="none" aria-hidden="true">
              <rect width="38" height="24" rx="3" fill="#1A1A22" stroke="rgba(255,255,255,0.12)" />
              <path d="M14.5 16H17L19.5 8H17L14.5 16Z" fill="#fff" />
              <path d="M26.5 16C27.5 16 28 15.5 28 14.5V11.5C28 10.5 27.5 10 26.5 10H23.5C22.5 10 22 10.5 22 11.5V14.5C22 15.5 22.5 16 23.5 16H26.5Z" fill="#fff" />
            </svg>
          </div>
        </div>
      </div>
    </footer>
  );
}
