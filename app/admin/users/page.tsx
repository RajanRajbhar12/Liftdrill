"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { getAllUsers, updateUserProfile } from "@/lib/actions"
import { toast } from "sonner"
import { UserList } from "./components/UserList"

interface Profile {
  id: string
  username: string
  full_name: string
  email: string
  avatar_url: string | null
  bio: string | null
  total_earnings: number
  challenges_won: number
  challenges_created: number
  created_at: string
  updated_at: string
  is_suspended?: boolean
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await getAllUsers()
      setUsers(data)
    } catch (error) {
      console.error("Error loading users:", error)
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleUserUpdate = async (userId: string, updates: Partial<Profile>) => {
    try {
      const result = await updateUserProfile(userId, updates)
      if (result.success) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, ...updates } : user
        ))
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      console.error("Error updating user:", error)
      toast.error(error.message || "Failed to update user")
      throw error
    }
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
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="text-sm text-gray-500">
          Total Users: {users.length}
        </div>
      </div>
      
      <Card className="p-6">
        <UserList users={users} onUserUpdate={handleUserUpdate} />
      </Card>
    </div>
  )
} 