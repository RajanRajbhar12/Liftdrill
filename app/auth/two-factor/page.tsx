"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Shield, ArrowRight, Loader2, Lock } from "lucide-react"
import { motion } from "framer-motion"

export default function TwoFactorAuthPage() {
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!otp) {
      setError("Please enter the OTP.");
      toast({
        title: "OTP Required",
        description: "Please enter the verification code.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      // Assume the user is trying to enable 2FA and verifies the code
      // In a real implementation, this would likely call a server-side function
      // that uses the user's security details to verify the OTP.
      // For demonstration, we'll simulate success.

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if OTP is valid (simulated)
      if (otp === "123456") { // Replace with actual OTP verification logic
         toast({
          title: "Two-Factor Auth Enabled",
          description: "You have successfully enabled 2FA.",
        });
        router.push("/settings"); // Redirect to settings or profile page

      } else {
        setError("Invalid OTP. Please try again.");
        toast({
          title: "Verification Failed",
          description: "The entered code is incorrect.",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      setError(error.message || "An unexpected error occurred during verification.");
      toast({
        title: "Error",
        description: error.message || "Failed to verify OTP.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
       const supabase = createClient();
       // In a real implementation, this would generate and send an OTP
       // to the user's verified channel (email, phone, authenticator app)
       // For demonstration, we'll simulate sending an OTP.

       // Simulate API call delay
       await new Promise(resolve => setTimeout(resolve, 1000));

       setMessage("A verification code has been sent. Please enter it below.");
       toast({
         title: "Code Sent",
         description: "Check your email or authenticator app for the code.",
       });
       // In a real app, you'd transition to the verification step UI
       // For this example, we'll just show the input field after this.

    } catch (error: any) {
      setError(error.message || "Failed to initiate 2FA setup.");
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code.",
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
            <CardTitle className="text-3xl font-bold text-gray-800">Two-Factor Authentication</CardTitle>
            <p className="text-gray-600">Secure your account with an extra layer of protection.</p>
          </CardHeader>
          <CardContent>
            {!message ? (
              // Initial state: Offer to set up 2FA
              <div className="text-center space-y-6">
                 <Shield className="mx-auto h-16 w-16 text-blue-600" />
                 <h3 className="text-xl font-semibold text-gray-800">Set up 2FA</h3>
                 <p className="text-gray-600">Add an extra step to verify your identity when logging in.</p>
                 <Button onClick={handleSetup2FA} className="w-full bg-blue-800 hover:bg-blue-700 text-white rounded-xl" disabled={loading}>
                    {loading ? (
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   ) : null}
                   Enable Two-Factor Auth
                 </Button>
                 {error && <p className="text-sm text-red-600 text-center">{error}</p>}
              </div>
            ) : (
              // Verification state: Enter the OTP
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="text-center space-y-2">
                   <Lock className="mx-auto h-12 w-12 text-indigo-600" />
                  <h3 className="text-xl font-semibold text-gray-800">Verify Code</h3>
                  <p className="text-sm text-gray-600">{message}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter the 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    className="rounded-xl text-center text-lg tracking-widest"
                  />
                </div>
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                <Button type="submit" className="w-full bg-blue-800 hover:bg-blue-700 text-white rounded-xl" disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Verify Code
                </Button>
                 <Button type="button" variant="link" className="w-full text-gray-600" onClick={() => setMessage(null)} disabled={loading}>
                   Cancel Setup
                 </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 