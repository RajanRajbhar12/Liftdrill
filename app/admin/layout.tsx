"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { BarChart3, Users, Trophy, Video, Settings, LogOut, Home, Bell, DollarSign, Shield, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

const adminNavigation = [
  { name: "Dashboard", href: "/admin", icon: BarChart3 },
  { name: "Submissions", href: "/admin/submissions", icon: Video },
  { name: "Challenges", href: "/admin/challenges", icon: Trophy },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Payments", href: "/admin/payments", icon: DollarSign },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar (Desktop) - Hidden, replaced by drawer */}
      <div className="hidden">
        <div className="h-14 flex items-center px-4 border-b flex-shrink-0">
          <Link href="/admin" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-800 to-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl">Admin Panel</span>
          </Link>
        </div>
        <nav className="flex-1 py-4 px-4 space-y-1 overflow-y-auto">
          {adminNavigation.map((item) => (
            <Button
              key={item.name}
              variant={pathname === item.href ? "secondary" : "ghost"}
              className="w-full justify-start rounded-xl h-10"
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-5 w-5" />
                {item.name}
              </Link>
            </Button>
          ))}
          <Separator className="my-4" />
        </nav>
        {/* Original Exit Admin button container - hidden */}
        <div className="p-4 border-t flex-shrink-0 w-full hidden">
          <Button variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl h-10 overflow-hidden" asChild>
            <Link href="/" className="flex items-center w-full">
              <LogOut className="mr-2 h-5 w-5 flex-shrink-0" />
              <span className="truncate">Exit Admin</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Admin Topbar */}
        <div className="h-14 bg-white border-b flex items-center justify-between px-4 w-full flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Menu button visible on all sizes to toggle drawer */}
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="h-9 w-9">
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="h-7 w-7 bg-gradient-to-r from-blue-800 to-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              {/* Hide Admin text on mobile to save space */}
              <span className="font-bold text-base hidden md:inline">Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
          </div>
        </div>

        {/* Navigation Drawer (Mobile and Desktop) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 z-40"
                onClick={toggleMobileMenu}
              />
              {/* Drawer */}
              <motion.div
                initial={{ opacity: 0, x: -300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ type: "spring", damping: 20 }}
                className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r flex flex-col"
              >
                <div className="h-14 flex items-center px-4 border-b flex-shrink-0">
                  <Link href="/admin" className="flex items-center space-x-2" onClick={toggleMobileMenu}>
                    <div className="h-7 w-7 bg-gradient-to-r from-blue-800 to-blue-600 rounded-lg flex items-center justify-center">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold text-base">Admin Panel</span>
                  </Link>
                </div>
                <nav className="flex flex-col flex-1 py-4 px-4 space-y-1 overflow-y-auto">
                  {adminNavigation.map((item) => (
                    <Button
                      key={item.name}
                      variant={pathname === item.href ? "secondary" : "ghost"}
                      className="w-full justify-start rounded-xl h-10"
                      asChild
                      onClick={toggleMobileMenu}
                    >
                      <Link href={item.href}>
                        <item.icon className="mr-2 h-5 w-5" />
                        {item.name}
                      </Link>
                    </Button>
                  ))}
                  <Separator className="my-4" />
                   {/* Exit Admin button inside drawer */}
                  <Button variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl h-10" asChild>
                    <Link href="/" className="flex items-center w-full" onClick={toggleMobileMenu}>
                      <LogOut className="mr-2 h-5 w-5 flex-shrink-0" />
                      <span className="truncate">Exit Admin</span>
                    </Link>
                  </Button>
                </nav>
                {/* This div was causing issues, removing content */}
                 <div className="p-4 border-t flex-shrink-0 w-full hidden">
                 </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Page Content */}
        {/* flex-1 makes this div grow to fill the remaining height, overflow-y-auto allows vertical scrolling within this area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}