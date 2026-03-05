import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const poppins = Poppins({
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700', '900'],
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Rentr — Real reviews from real tenants',
  description:
    'Find honest, anonymous reviews for apartments and rentals near you. Know before you sign.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
