"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Shield, Lock, Loader2, Eye, EyeOff } from "lucide-react"

export default function AdminAccessPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Check if password is "RAJAN"
    if (password === "RAJAN") {
      // Set admin access cookie
      document.cookie = "admin_access=true; path=/; max-age=3600" // 1 hour

      toast({
        title: "Access granted",
        description: "Welcome to the admin panel",
      })

      router.push("/admin")
    } else {
      setError("Invalid password")
      toast({
        title: "Access denied",
        description: "Invalid admin password",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl flex items-center justify-center shadow-2xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-bold text-white">Admin Access</h1>
          <p className="mt-2 text-gray-400">Enter the admin password to continue</p>
        </div>

        <Card className="border-0 shadow-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Restricted Area
            </CardTitle>
            <CardDescription className="text-gray-400">
              This area is restricted to authorized administrators only
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Admin Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError("")
                    }}
                    className={`bg-slate-700 border-slate-600 text-white placeholder-gray-400 pr-10 ${
                      error ? "border-red-500" : ""
                    }`}
                    disabled={loading}
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
              </div>

              <Button
                type="submit"
                disabled={loading || !password}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 h-12 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Access Admin Panel
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-white">Security Notice</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    This admin panel provides access to sensitive platform data and controls. Unauthorized access is
                    strictly prohibited.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="ghost" onClick={() => router.push("/")} className="text-gray-400 hover:text-white">
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
