import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tuition Tracker',
  description: 'Track your tuition classes and cycles easily',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
