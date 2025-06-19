"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { User, Settings, LogOut, Trophy, Wallet, Target, Menu, X } from "lucide-react"
import { motion } from "framer-motion"

export function Navigation() {
  const pathname = usePathname()
  const { user, loading, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-indigo-900 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left section: Logo and Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-yellow-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">LiftDrill</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/challenges"
                className={`transition-colors hover:text-white/90 ${
                  pathname === "/challenges" ? "text-white" : "text-white/70"
                }`}
              >
                Challenges
              </Link>
              <Link
                href="/leaderboard"
                className={`transition-colors hover:text-white/90 ${
                  pathname === "/leaderboard" ? "text-white" : "text-white/70"
                }`}
              >
                Leaderboard
              </Link>
              <Link
                href="/how-it-works"
                className={`transition-colors hover:text-white/90 ${
                  pathname === "/how-it-works" ? "text-white" : "text-white/70"
                }`}
              >
                How It Works
              </Link>
            </nav>
          </div>

          {/* Right section: Auth/Profile and Mobile Menu Toggle*/}
          <div className="flex items-center space-x-4">
             {/* Mobile Menu Toggle */}
             <div className="md:hidden flex items-center">
               <Button
                 variant="ghost"
                 size="icon"
                 className="text-white hover:bg-white/10"
                 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
               >
                 {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
               </Button>
             </div>

            {loading ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-white/30" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url as string} alt={user.user_metadata?.full_name as string || "User"} />
                      <AvatarFallback className="bg-blue-700 text-white font-semibold">{user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name as string || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex w-full cursor-pointer items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wallet" className="flex w-full cursor-pointer items-center">
                      <Wallet className="mr-2 h-4 w-4" />
                      <span>Wallet</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex w-full cursor-pointer items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex cursor-pointer items-center text-red-600 focus:text-red-600"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" asChild className="text-white hover:bg-white/10 hover:text-white">
                  <Link href="/auth/login">Log in</Link>
                </Button>
                <Button asChild className="bg-white text-blue-800 hover:bg-gray-200">
                  <Link href="/auth/signup">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="md:hidden bg-blue-800/95 backdrop-blur-sm absolute top-16 left-0 w-full py-4 shadow-lg"
        >
          <nav className="flex flex-col items-center space-y-4 text-sm font-medium">
            <Link href="/challenges" className="hover:text-white/90" onClick={() => setIsMobileMenuOpen(false)}>Challenges</Link>
            <Link href="/leaderboard" className="hover:text-white/90" onClick={() => setIsMobileMenuOpen(false)}>Leaderboard</Link>
            <Link href="/how-it-works" className="hover:text-white/90" onClick={() => setIsMobileMenuOpen(false)}>How It Works</Link>
            {/* Add mobile-specific auth links if needed, or rely on profile dropdown */}
          </nav>
        </motion.div>
      )}
    </header>
  )
} 