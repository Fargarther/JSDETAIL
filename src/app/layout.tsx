import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Single Line Scroll Effect',
  description: 'Interactive line drawing that reveals on scroll',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}