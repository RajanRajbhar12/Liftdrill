"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { CreditCard, History, ArrowLeft, Wallet } from "lucide-react"

const navigation = [
  {
    name: "Payment Methods",
    href: "/billing/payment-methods",
    icon: CreditCard,
  },
  {
    name: "Transaction History",
    href: "/billing/history",
    icon: History,
  },
  {
    name: "Wallet",
    href: "/billing/wallet",
    icon: Wallet,
  },
]

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/settings"
          className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Settings
        </Link>

        <div className="flex gap-4 mb-8">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </div>

        {children}
      </div>
    </div>
  )
} 