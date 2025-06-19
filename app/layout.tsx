import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Navigation } from "@/components/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LiftDrill - Win Real Money with Fitness Challenges",
  description: "Join fitness challenges, compete with others, and win real money rewards. Turn your fitness journey into a rewarding experience with LiftDrill.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <Navigation />
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-white">{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
