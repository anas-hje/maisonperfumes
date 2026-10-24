import { Metadata } from 'next'
import AProposClient from './AProposClient'

export const metadata: Metadata = {
  title: 'Notre Histoire | Maison',
  description: 'Découvrez l\'histoire de Maison, votre parfumerie de luxe marocaine. Authenticité, excellence et tradition.',
}

export default function AProposPage() {
  return <AProposClient />
}
