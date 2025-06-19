"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Trash2, Save, Loader2, ChevronRight, User, Settings, CreditCard, Shield, Bell, Wallet } from "lucide-react"
import { ConfirmModal } from "@/components/confirm-modal"
import { motion } from "framer-motion"
import Link from "next/link"

export default function SettingsPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savingEmail, setSavingEmail] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  })

  // Fetch user email on load (you'll need to implement this)
  // useEffect(() => {
  //   const fetchUser = async () => {
  //     const supabase = createClient();
  //     const { data: { user } } = await supabase.auth.getUser();
  //     if (user) {
  //       setEmail(user.email || '');
  //     }
  //   };
  //   fetchUser();
  // }, []);

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingEmail(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ email: email })
    if (error) {
      toast({
        title: "Error updating email",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Email updated",
        description: "Please check your new email address to confirm the change.",
      })
    }
    setSavingEmail(false)
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please ensure both password fields match.",
        variant: "destructive",
      })
      return
    }
    setSavingPassword(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: password })
    if (error) {
      toast({
        title: "Error updating password",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      })
      setPassword("")
      setConfirmPassword("")
    }
    setSavingPassword(false)
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    const supabase = createClient()
    // Warning: Deleting a user is irreversible. Implement with extreme caution.
    // You might want a server-side function for this with re-authentication checks.
    const { error } = await supabase.auth.admin.deleteUser(
      // Replace with actual user ID
      (await supabase.auth.getUser()).data.user?.id || '', // DANGEROUS: Use server-side and re-auth!
    )

    if (error) {
      toast({
        title: "Error deleting account",
        description: error.message,
        variant: "destructive",
      })
      setIsDeleting(false)
    } else {
      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
      })
      router.push("/") // Redirect to homepage after deletion
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData({ ...formData, [id]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
        },
      })

      if (error) throw error

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account and preferences.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Navigation Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="shadow-xl border-0 rounded-2xl">
              <CardContent className="p-0">
                <div className="flex flex-col">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 rounded-none px-4 py-3 text-blue-800 bg-blue-50 transition-colors hover:bg-blue-100"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    href="/billing/payment-methods"
                    className="flex items-center gap-3 rounded-none px-4 py-3 text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    <CreditCard className="h-4 w-4" />
                    Payment Methods
                  </Link>
                  <Link
                    href="/wallet"
                    className="flex items-center gap-3 rounded-none px-4 py-3 text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    <Wallet className="h-4 w-4" />
                    Wallet
                  </Link>
                  <Link
                    href="/auth/two-factor"
                    className="flex items-center gap-3 rounded-none px-4 py-3 text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    <Shield className="h-4 w-4" />
                    Security
                  </Link>
                  <Link
                    href="/notifications"
                    className="flex items-center gap-3 rounded-none px-4 py-3 text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    <Bell className="h-4 w-4" />
                    Notifications
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-2"
          >
            <Card className="shadow-xl border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="rounded-xl"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="rounded-xl"
                    />
                  </div>
                  <Button type="submit" className="bg-blue-800 hover:bg-blue-700 text-white rounded-xl" disabled={loading}>
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="border-red-500 shadow-xl rounded-2xl">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-xl font-semibold text-red-800">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-red-700">Proceed with caution. These actions are irreversible.</p>
              <div>
                <Button
                  variant="destructive"
                  className="rounded-xl"
                  onClick={() => setIsDeleteModalOpen(true)}
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteAccount}
          title="Confirm Account Deletion"
          description="Are you sure you want to delete your account? This action cannot be undone."
          confirmText="Delete Account"
          cancelText="Cancel"
          isConfirming={isDeleting}
        />
      </div>
    </div>
  )
} 