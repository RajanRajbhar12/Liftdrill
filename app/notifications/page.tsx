"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Settings, Trash2, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

// Define interface for notification
interface Notification {
  id: string
  message: string
  timestamp: string // ISO date string
  read: boolean
  type: "challenge" | "wallet" | "system"
}

// Simulated Notifications Data (replace with data fetched from backend)
const simulatedNotifications: Notification[] = [
  { id: "notif1", message: "You won the 'Morning Run Streak' challenge! ₹500 added to your wallet.", timestamp: "2023-11-05T09:30:00Z", read: false, type: "challenge" },
  { id: "notif2", message: "Your withdrawal request of ₹1000 has been processed.", timestamp: "2023-11-04T15:00:00Z", read: true, type: "wallet" },
  { id: "notif3", message: "New challenge 'Weekend Warrior' is now open for registration.", timestamp: "2023-11-03T10:00:00Z", read: true, type: "system" },
   { id: "notif4", message: "You have a new message from challenge 'Daily Steps'.", timestamp: "2023-11-02T14:00:00Z", read: false, type: "challenge" },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false)

  // Simulate fetching notifications on component mount
  useEffect(() => {
    setLoading(true)
    const delay = setTimeout(() => {
      // Sort notifications by timestamp descending
      setNotifications(simulatedNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))
      setLoading(false)
    }, 1000) // Simulate network delay

    return () => clearTimeout(delay)
  }, [])

  const handleMarkAllAsRead = async () => {
    setIsMarkingAllRead(true)
    // Simulate API call to mark all as read (replace with actual backend logic)
    await new Promise(resolve => setTimeout(resolve, 1500))

    setNotifications(notifications.map(notif => ({ ...notif, read: true })))
    toast({
      title: "Notifications Updated",
      description: "All notifications marked as read.",
    })
    setIsMarkingAllRead(false)
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white">
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-blue-800" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
             <h1 className="text-4xl font-bold text-gray-800 mb-2">Notifications</h1>
             <p className="text-gray-600">Stay updated on your activity and challenges.</p>
          </div>
          {notifications.length > 0 && (
             <Button
               variant="outline"
               className="rounded-xl"
               onClick={handleMarkAllAsRead}
               disabled={isMarkingAllRead || notifications.every(notif => notif.read)}
             >
               {isMarkingAllRead ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
               Mark all as read
             </Button>
          )}
        </motion.div>

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="shadow-xl border-0 rounded-2xl">
            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                   <Bell className="mx-auto h-12 w-12 mb-4 text-gray-400"/>
                   <p>No new notifications.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`flex items-center justify-between p-4 ${notif.read ? "bg-white" : "bg-blue-50 hover:bg-blue-100"} transition-colors duration-200`}>
                      <div className="flex items-start space-x-3 flex-grow">
                         <Bell className={`h-5 w-5 ${notif.read ? "text-gray-500" : "text-blue-600"} flex-shrink-0 mt-1`} />
                         <div>
                           <p className={`font-medium ${notif.read ? "text-gray-600" : "text-gray-800"}`}>{notif.message}</p>
                           <p className="text-sm text-gray-500 mt-1">{new Date(notif.timestamp).toLocaleString()}</p>
                         </div>
                      </div>
                       {/* Optionally add a button to mark as read individually or take action */}
                       {/* {!notif.read && (
                         <Button variant="ghost" size="sm">Mark as Read</Button>
                       )} */}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 