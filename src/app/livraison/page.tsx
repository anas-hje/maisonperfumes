import { Metadata } from 'next'
import LivraisonClient from './LivraisonClient'

export const metadata: Metadata = {
  title: 'Livraison & Retours | Maison',
  description: 'Informations sur la livraison et les retours pour vos commandes Maison.',
}

export default function LivraisonPage() {
  return <LivraisonClient />
}
