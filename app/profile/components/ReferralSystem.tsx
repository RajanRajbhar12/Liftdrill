"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Share2, Users } from "lucide-react"
import { generateReferralCode } from "@/lib/actions"
import { toast } from "sonner"

interface ReferralSystemProps {
  userId: string
}

export function ReferralSystem({ userId }: ReferralSystemProps) {
  const [referralCode, setReferralCode] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (userId) {
      loadReferralCode()
    }
  }, [userId])

  const loadReferralCode = async () => {
    try {
      setError(null)
      const response = await generateReferralCode(userId)
      if (response.success && response.code) {
        setReferralCode(response.code)
      } else {
        setError(response.error || "Failed to generate referral code")
      }
    } catch (error: any) {
      console.error("Error loading referral code:", error)
      setError(error.message || "An error occurred while generating referral code")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      const referralLink = `${window.location.origin}/signup?ref=${referralCode}`
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      toast.success("Referral link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      toast.error("Failed to copy referral link")
    }
  }

  const shareReferral = async () => {
    try {
      const referralLink = `${window.location.origin}/signup?ref=${referralCode}`
      if (navigator.share) {
        await navigator.share({
          title: "Join LiftDrill Fitness Challenges",
          text: "Join me on LiftDrill and get a welcome bonus! Use my referral link to sign up.",
          url: referralLink,
        })
      } else {
        copyToClipboard()
      }
    } catch (error) {
      console.error("Error sharing:", error)
      toast.error("Failed to share referral link")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-red-500 text-center">Error loading referral system: {error}</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold">Refer Friends</h3>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg">
          <p className="text-sm text-indigo-800 mb-2">
            Invite friends to join LiftDrill and earn rewards!
          </p>
          <ul className="text-sm text-indigo-700 space-y-1">
            <li>• You get 500 XP for each friend who joins</li>
            <li>• Your friend gets 200 XP as a welcome bonus</li>
            <li>• Share your unique referral link below</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Input
            value={`${window.location.origin}/signup?ref=${referralCode}`}
            readOnly
            className="flex-1"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={copyToClipboard}
            className={copied ? "bg-green-50" : ""}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button onClick={shareReferral}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </Card>
  )
} 