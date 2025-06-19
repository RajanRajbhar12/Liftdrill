"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Menu, X, Trophy, Plus, User, Settings, LogOut, Shield } from "lucide-react"
import { getCurrentUser, signOut } from "@/lib/auth"

interface User {
  id: string
  name: string
  email: string
  username: string
  avatar_url?: string
  total_earnings?: number
  is_admin?: boolean
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const userData = await getCurrentUser()
      setUser(userData)
    }
    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut()
      // Force a page reload to clear all client-side state
      window.location.href = "/"
    } catch (error) {
      console.error("Error during logout:", error)
      // If there's an error, still try to clear the state and redirect
      window.location.href = "/"
    }
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              FitChallenge
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/challenges" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
              Challenges
            </Link>
            <Link href="/create-challenge" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
              Create Challenge
            </Link>
            <Link href="/leaderboard" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
              Leaderboard
            </Link>
            <Link href="/how-it-works" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
              How it Works
            </Link>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button asChild variant="outline" className="flex items-center gap-2">
                  <Link href="/create-challenge">
                    <Plus className="h-4 w-4" />
                    Create
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || "/placeholder.svg?height=40&width=40"} alt={user.name} />
                        <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            ₹{user.total_earnings?.toLocaleString() || "0"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">earned</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/access" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin Access
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
                      <LogOut className="h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <Link
                href="/challenges"
                className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                Challenges
              </Link>
              <Link
                href="/create-challenge"
                className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                Create Challenge
              </Link>
              <Link
                href="/leaderboard"
                className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                Leaderboard
              </Link>
              <Link
                href="/how-it-works"
                className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                How it Works
              </Link>

              {user ? (
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url || "/placeholder.svg?height=40&width=40"} alt={user.name} />
                      <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">₹{user.total_earnings?.toLocaleString() || "0"} earned</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Link
                      href="/profile"
                      className="block text-gray-700 hover:text-green-600 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/admin/access"
                      className="block text-gray-700 hover:text-green-600 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Admin Access
                    </Link>
                    <Link
                      href="/settings"
                      className="block text-gray-700 hover:text-green-600 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsOpen(false)
                      }}
                      className="block w-full text-left text-red-600 hover:text-red-700 transition-colors"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <Link
                    href="/auth/login"
                    className="block text-gray-700 hover:text-green-600 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block text-green-600 hover:text-green-700 transition-colors font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
