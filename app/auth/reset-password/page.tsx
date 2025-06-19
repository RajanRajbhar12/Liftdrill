"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      setCode(codeParam);
    } else {
      // No code found, potentially redirect or show an error
      setError("Invalid reset link. Please request a new one.");
      toast({
        title: "Invalid Link",
        description: "Password reset code is missing.",
        variant: "destructive",
      });
       // Optional: redirect to forgot password page after a delay
       const timer = setTimeout(() => {
         router.push("/auth/forgot-password");
       }, 5000);
       return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      toast({
        title: "Password Mismatch",
        description: "Please ensure your new password and confirm password match.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!code) {
       setError("Invalid reset link. Code is missing.");
       toast({
         title: "Invalid Link",
         description: "Password reset code is missing.",
         variant: "destructive",
       });
       setLoading(false);
       return;
    }

    try {
      const supabase = createClient();

      // Use the code to update the user's password
      const { error: updateError } = await supabase.auth.exchangeCodeForSession(code);

      if (updateError) {
        throw updateError;
      }

      const { error: setPasswordError } = await supabase.auth.updateUser({
        password: password,
      });

      if (setPasswordError) {
         throw setPasswordError;
      }

      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated. You can now log in.",
      });

      // Redirect to login page
      router.push("/auth/login");
    } catch (error: any) {
      setError(error.message || "Failed to reset password.");
      toast({
        title: "Error",
        description: error.message || "Failed to reset password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-white">
        <div className="text-center text-red-600 text-lg font-semibold">
          {error}
        </div>
      </div>
    );
  }

  if (!code) {
     // Optionally show a loading state or a message while checking for code
      return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-white">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-800 mb-4" />
          <p className="text-gray-700">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4"
      >
        <Card className="shadow-xl border-0 rounded-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-800">Reset Your Password</CardTitle>
            <p className="text-gray-600">Enter your new password below.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="rounded-xl"
                />
              </div>
              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
              <Button type="submit" className="w-full bg-blue-800 hover:bg-blue-700 text-white rounded-xl" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Reset Password
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="mt-8 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link href="/auth/login" className="font-semibold leading-6 text-blue-800 hover:text-blue-700">
            Login here
          </Link>
        </p>
      </motion.div>
    </div>
  );
} 