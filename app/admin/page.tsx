"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Video,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  DollarSign,
  Users,
  Trophy,
  Shield,
  LogOut,
  Loader2,
  IndianRupee,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { getChallenges, getSubmissions, getAllUsers, getPayments } from "@/lib/actions"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define interfaces for admin data
interface AdminUser {
  id: string
  name?: string | null
  email?: string | null
  avatar_url?: string | null
}

interface AdminChallenge {
  id: string
  title?: string | null
  prize_pool?: number | null
  type?: string | null
  start_date?: string | null
  end_date?: string | null
  entry_fee?: number | null
  status?: string | null
}

interface AdminSubmission {
  id: string
  user?: AdminUser | null
  challenge?: AdminChallenge | null
  status: "pending" | "approved" | "rejected" | string
  created_at: string
  score: number | null
}

interface AdminPayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  // Add other relevant payment fields here
}

interface DashboardStats {
  totalUsers: number
  totalChallenges: number
  totalSubmissions: number
  totalRevenue: number
  pendingSubmissions: number
  activeChallenges: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalChallenges: 0,
    totalSubmissions: 0,
    totalRevenue: 0,
    pendingSubmissions: 0,
    activeChallenges: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check admin access
    const adminAccess = document.cookie.includes("admin_access=true")
    if (!adminAccess) {
      router.push("/admin/access")
      return
    }

    loadDashboardData()
  }, [router])

  const loadDashboardData = async () => {
    try {
      const [users, challenges, submissions, payments] = await Promise.all([
        getAllUsers(),
        getChallenges(),
        getSubmissions(),
        getPayments(),
      ])

      const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0)
      const pendingSubmissions = submissions.filter(sub => sub.status === "pending").length
      const activeChallenges = challenges.filter(challenge => challenge.status === "active").length

      setStats({
        totalUsers: users.length,
        totalChallenges: challenges.length,
        totalSubmissions: submissions.length,
        totalRevenue,
        pendingSubmissions,
        activeChallenges,
      })
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    document.cookie = "admin_access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    router.push("/")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={loadDashboardData}>Refresh Data</Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Challenges</p>
              <p className="text-2xl font-bold">{stats.activeChallenges}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Video className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Submissions</p>
              <p className="text-2xl font-bold">{stats.pendingSubmissions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <IndianRupee className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold">₹{stats.totalRevenue}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Submissions</p>
              <p className="text-2xl font-bold">{stats.totalSubmissions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Challenges</p>
              <p className="text-2xl font-bold">{stats.totalChallenges}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
              <Button variant="outline" className="justify-start">
                <Trophy className="mr-2 h-4 w-4" />
                Create Challenge
              </Button>
              <Button variant="outline" className="justify-start">
                <Video className="mr-2 h-4 w-4" />
                Review Submissions
              </Button>
              <Button variant="outline" className="justify-start">
                <IndianRupee className="mr-2 h-4 w-4" />
                View Payments
              </Button>
              <Button variant="outline" className="justify-start">
                <AlertCircle className="mr-2 h-4 w-4" />
                System Settings
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
            {/* Add user list component here */}
          </Card>
        </TabsContent>

        <TabsContent value="challenges">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Active Challenges</h2>
            {/* Add challenges list component here */}
          </Card>
        </TabsContent>

        <TabsContent value="submissions">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Pending Submissions</h2>
            {/* Add submissions list component here */}
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Payments</h2>
            {/* Add payments list component here */}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
