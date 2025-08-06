import type React from "react"
import type { Metadata } from "next"
import { Inter, Orbitron } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SessionProvider } from "@/components/providers/SessionProvider"
import { Toaster } from "@/components/ui/sonner"
import GlobalErrorBoundary from "@/components/error/GlobalErrorBoundary"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" })

export const metadata: Metadata = {
  title: "NEUROTRAUMA CON 2026 - The Future of Neurotrauma Excellence",
  description:
    "Revolutionary neurotrauma conference in Hyderabad, Telangana. Where innovation meets precision in the future of medicine.",
  keywords: "neurotrauma, conference, medical, innovation, surgery, AI, robotics, Hyderabad",
  authors: [{ name: "Purplehat Tech" }],
  robots: "index, follow",
  openGraph: {
    title: "NEUROTRAUMA CON 2026 - The Future of Neurotrauma Excellence",
    description: "Revolutionary neurotrauma conference featuring AI, robotics, and cutting-edge medical innovations.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "NEUROTRAUMA CON 2026 - The Future of Neurotrauma Excellence",
    description: "Revolutionary neurotrauma conference featuring AI, robotics, and cutting-edge medical innovations.",
  },
  generator: 'v0.dev'
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${orbitron.variable}`} suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <GlobalErrorBoundary>
          <SessionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange={false}
            >
              <div className="relative min-h-screen">
                {children}
                <Toaster />

              {/* Background particles - Fixed positions to prevent memory leaks */}
              <div className="fixed inset-0 pointer-events-none z-0 opacity-60 dark:opacity-30">
                <div className="particle animate-pulse" style={{ left: '10%', top: '20%', width: '2px', height: '2px', background: 'hsl(25, 70%, 60%)', animationDelay: '0s', animationDuration: '8s' }} />
                <div className="particle animate-pulse" style={{ left: '80%', top: '10%', width: '3px', height: '3px', background: 'hsl(35, 70%, 60%)', animationDelay: '2s', animationDuration: '10s' }} />
                <div className="particle animate-pulse" style={{ left: '60%', top: '70%', width: '2px', height: '2px', background: 'hsl(20, 70%, 60%)', animationDelay: '4s', animationDuration: '12s' }} />
                <div className="particle animate-pulse" style={{ left: '30%', top: '80%', width: '4px', height: '4px', background: 'hsl(40, 70%, 60%)', animationDelay: '1s', animationDuration: '9s' }} />
                <div className="particle animate-pulse" style={{ left: '90%', top: '50%', width: '2px', height: '2px', background: 'hsl(30, 70%, 60%)', animationDelay: '3s', animationDuration: '11s' }} />
                <div className="particle animate-pulse" style={{ left: '20%', top: '40%', width: '3px', height: '3px', background: 'hsl(25, 70%, 60%)', animationDelay: '5s', animationDuration: '7s' }} />
                <div className="particle animate-pulse" style={{ left: '70%', top: '30%', width: '2px', height: '2px', background: 'hsl(35, 70%, 60%)', animationDelay: '6s', animationDuration: '13s' }} />
                <div className="particle animate-pulse" style={{ left: '50%', top: '90%', width: '3px', height: '3px', background: 'hsl(20, 70%, 60%)', animationDelay: '2s', animationDuration: '8s' }} />
              </div>
            </div>
          </ThemeProvider>
          </SessionProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  )
}
