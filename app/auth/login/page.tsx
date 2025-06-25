"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import { Mail, Github, ArrowRight, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

function LoginPageInner() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/challenges"
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      // Redirect user after successful login
      router.push("/challenges"); // Or wherever the user should go after login
      router.refresh(); // Refresh the current route to fetch updated server data (e.g., user session)

    } catch (error: any) {
      setMessage(error.message || "Invalid credentials.");
      toast({
        title: "Login Failed",
        description: error.message || "Please check your email and password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-white py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4"
      >
        <Card className="shadow-xl border-0 rounded-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-800">Welcome Back</CardTitle>
            <p className="text-gray-600">Sign in to your account.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>
              {message && <p className="text-sm text-red-600 text-center">{message}</p>}
              <Button type="submit" className="w-full bg-blue-800 hover:bg-blue-700 text-white rounded-xl" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Sign In
              </Button>
              <div className="text-center text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="font-semibold text-blue-800 hover:text-blue-700"
                >
                  Forgot password?
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
        <p className="mt-8 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-semibold leading-6 text-blue-800 hover:text-blue-700">
            Sign up here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  )
}
