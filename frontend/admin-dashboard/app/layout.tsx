import type React from "react"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
// <CHANGE> Added AuthProvider for authentication context
import { AuthProvider } from "@/lib/auth-context"

// ... existing code ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {/* <CHANGE> Wrapped children with AuthProvider for global auth state */}
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.app'
    };
