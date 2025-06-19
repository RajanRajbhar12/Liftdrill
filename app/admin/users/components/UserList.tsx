"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { MoreVertical, Search, Ban, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface User {
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

interface UserListProps {
  users: User[]
  onUserUpdate: (userId: string, updates: Partial<User>) => Promise<void>
}

export function UserList({ users, onUserUpdate }: UserListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSuspendUser = async (userId: string) => {
    try {
      setLoading((prev) => ({ ...prev, [userId]: true }))
      await onUserUpdate(userId, { is_suspended: true })
      toast.success("User suspended successfully")
    } catch (error) {
      toast.error("Failed to suspend user")
    } finally {
      setLoading((prev) => ({ ...prev, [userId]: false }))
    }
  }

  const handleUnsuspendUser = async (userId: string) => {
    try {
      setLoading((prev) => ({ ...prev, [userId]: true }))
      await onUserUpdate(userId, { is_suspended: false })
      toast.success("User unsuspended successfully")
    } catch (error) {
      toast.error("Failed to unsuspend user")
    } finally {
      setLoading((prev) => ({ ...prev, [userId]: false }))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
                  <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{user.full_name}</h3>
                    {user.is_suspended ? (
                      <span className="text-red-500 text-sm flex items-center gap-1">
                        <Ban className="h-4 w-4" /> Suspended
                      </span>
                    ) : (
                      <span className="text-green-500 text-sm flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-green-600">₹{user.total_earnings}</p>
                      <p className="text-xs text-gray-500">Earnings</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{user.challenges_won}</p>
                      <p className="text-xs text-gray-500">Won</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{user.challenges_created}</p>
                      <p className="text-xs text-gray-500">Created</p>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={loading[user.id]}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => window.location.href = `/admin/users/${user.id}`}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = `/admin/users/${user.id}/edit`}>
                      Edit User
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {user.is_suspended ? (
                      <DropdownMenuItem
                        onClick={() => handleUnsuspendUser(user.id)}
                        className="text-green-600"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Unsuspend User
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => handleSuspendUser(user.id)}
                        className="text-red-600"
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        Suspend User
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 