import { Metadata } from 'next'
import FAQClient from './FAQClient'

export const metadata: Metadata = {
  title: 'Questions Fréquentes | Maison',
  description: 'Trouvez les réponses à vos questions sur les commandes, la livraison et les retours.',
}

export default function FAQPage() {
  return <FAQClient />
}
