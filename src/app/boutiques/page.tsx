import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nos Boutiques | Maison',
  description: 'Trouvez la boutique Maison la plus proche de chez vous.',
}

export default function BoutiquesPage() {
  const stores = [
    {
      id: 1,
      name: 'Maison Casablanca',
      location: 'Morocco Mall, Boulevard de la Corniche, Casablanca',
      hours: '10h-22h',
      phone: '+212 522 12 34 56',
    },
    {
      id: 2,
      name: 'Maison Rabat',
      location: 'Mega Mall, Avenue des FAR, Rabat',
      hours: '10h-21h',
      phone: '+212 537 12 34 56',
    },
    {
      id: 3,
      name: 'Maison Marrakech',
      location: 'Menara Mall, Avenue Mohammed VI, Marrakech',
      hours: '10h-22h',
      phone: '+212 524 12 34 56',
    }
  ]

  return (
    <div className="min-h-screen bg-graphite text-light font-sans pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl text-light uppercase tracking-widest mb-4">
            Nos Boutiques
          </h1>
          <p className="text-lg text-quartz font-light">
            Vivez l&apos;expérience Maison dans nos espaces dédiés
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
          {stores.map((store) => (
            <div key={store.id} className="bg-obsidian rounded-lg shadow-sm border border-white/10 overflow-hidden flex flex-col">
              <div className="h-48 bg-white/10 flex items-center justify-center relative">
                {/* Map placeholder */}
                <div className="absolute inset-0 bg-amber-100/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-amber opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="font-display text-xl text-light uppercase tracking-widest mb-4">
                  {store.name}
                </h3>
                
                <div className="space-y-4 text-sm text-quartz flex-grow">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 shrink-0 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span>{store.location}</span>
                  </div>
                  
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 shrink-0 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Ouvert tous les jours: {store.hours}</span>
                  </div>
                  
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 shrink-0 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{store.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-obsidian border border-white/10 rounded-lg p-12 text-center max-w-3xl mx-auto shadow-sm">
          <h2 className="font-display text-2xl text-light uppercase tracking-widest mb-4">
            Prochainement
          </h2>
          <p className="text-quartz leading-relaxed">
            Maison continue son expansion. Nous serons très bientôt ravis de vous accueillir dans 
            nos nouvelles boutiques à <strong className="text-light">Fès</strong> et <strong className="text-light">Tanger</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}
