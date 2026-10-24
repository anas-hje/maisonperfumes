import { Metadata } from 'next'
import SuiviCommandeClient from './SuiviCommandeClient'

export const metadata: Metadata = {
  title: 'Suivi de Commande | Maison',
  description: 'Suivez l\'état de votre commande Maison en temps réel.',
}

export default function SuiviCommandePage() {
  return <SuiviCommandeClient />
}
