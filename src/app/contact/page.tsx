import { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: 'Contactez-nous | Maison',
  description: 'Contactez notre service client pour toute question concernant la parfumerie marocaine Maison.',
}

export default function ContactPage() {
  return <ContactClient />
}
