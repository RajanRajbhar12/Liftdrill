"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Lock, Shield, ArrowLeft } from "lucide-react"

const navigation = [
  {
    name: "Change Password",
    href: "/auth/change-password",
    icon: Lock,
  },
  {
    name: "Two-Factor Auth",
    href: "/auth/two-factor",
    icon: Shield,
  },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg p-4 space-y-1">
              <Link
                href="/settings"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Settings
              </Link>
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  )
} 