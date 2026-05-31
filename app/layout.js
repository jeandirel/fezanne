import './globals.css'

export const metadata = {
  title: 'JUS FRAIS MAISON — Jus frais artisanaux livrés à Marseille',
  description: 'Des jus frais maison préparés chaque jour à Marseille. 100% naturel, sans conservateurs, pressés à froid. Livraison locale Vieux-Port.',
  keywords: 'jus frais, marseille, bissap, detox, jus naturel, livraison marseille, jus pressés à froid',
  openGraph: {
    title: 'JUS FRAIS MAISON — Marseille',
    description: 'Jus frais artisanaux livrés à Marseille. 100% naturel.',
    images: ['https://customer-assets.emergentagent.com/job_b5fcea21-fc07-4b62-8bdd-7fb278c3607f/artifacts/non7tytf_WhatsApp%20Image%202026-05-31%20at%2019.09.04%20%284%29.jpeg'],
    locale: 'fr_FR',
    type: 'website',
  },
  icons: {
    icon: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext y=%22.9em%22 font-size=%2290%22%3E%F0%9F%A5%A4%3C/text%3E%3C/svg%3E',
  },
}

export const viewport = {
  themeColor: '#1f3a2e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  )
}
