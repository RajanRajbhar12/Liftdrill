"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Target, Zap, Medal, Award } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Achievement {
  id: string
  badge_type: string
  awarded_at: string
}

interface UserStats {
  level: number
  xp: number
  streak_count: number
  challenges_won: number
  challenges_created: number
  total_earnings: number
}

interface AchievementsProps {
  userId: string
}

export function Achievements({ userId }: AchievementsProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAchievements()
  }, [userId])

  const loadAchievements = async () => {
    try {
      // Get user badges
      const { data: badges, error: badgesError } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", userId)
        .order("awarded_at", { ascending: false })

      if (badgesError) throw badgesError

      // Get user stats
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("level, xp, streak_count, challenges_won, challenges_created, total_earnings")
        .eq("id", userId)
        .single()

      if (profileError) throw profileError

      setAchievements(badges)
      setStats(profile)
    } catch (error) {
      console.error("Error loading achievements:", error)
    } finally {
      setLoading(false)
    }
  }

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case "level_1":
      case "level_5":
      case "level_10":
        return <Trophy className="h-6 w-6" />
      case "streak_7":
      case "streak_30":
        return <Zap className="h-6 w-6" />
      case "challenge_winner":
        return <Medal className="h-6 w-6" />
      case "challenge_creator":
        return <Target className="h-6 w-6" />
      default:
        return <Star className="h-6 w-6" />
    }
  }

  const getBadgeName = (badgeType: string) => {
    switch (badgeType) {
      case "level_1":
        return "Level 1 Achieved"
      case "level_5":
        return "Level 5 Achieved"
      case "level_10":
        return "Level 10 Achieved"
      case "streak_7":
        return "7 Day Streak"
      case "streak_30":
        return "30 Day Streak"
      case "challenge_winner":
        return "Challenge Winner"
      case "challenge_creator":
        return "Challenge Creator"
      default:
        return badgeType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!stats) return null

  const xpToNextLevel = (stats.level + 1) * 1000
  const xpProgress = (stats.xp % 1000) / 10

  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Level {stats.level}</h3>
            <p className="text-sm text-gray-500">
              {stats.xp} / {xpToNextLevel} XP
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold">{stats.streak_count} Day Streak</span>
          </div>
        </div>
        <Progress value={xpProgress} className="h-2" />
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
          <p className="text-2xl font-bold">{stats.challenges_won}</p>
          <p className="text-sm text-gray-500">Challenges Won</p>
        </Card>
        <Card className="p-4 text-center">
          <Target className="h-6 w-6 mx-auto mb-2 text-blue-500" />
          <p className="text-2xl font-bold">{stats.challenges_created}</p>
          <p className="text-sm text-gray-500">Challenges Created</p>
        </Card>
        <Card className="p-4 text-center">
          <Award className="h-6 w-6 mx-auto mb-2 text-green-500" />
          <p className="text-2xl font-bold">₹{stats.total_earnings}</p>
          <p className="text-sm text-gray-500">Total Earnings</p>
        </Card>
      </div>

      {/* Badges */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="flex flex-col items-center p-4 bg-gray-50 rounded-lg"
            >
              {getBadgeIcon(achievement.badge_type)}
              <p className="mt-2 text-sm font-medium text-center">
                {getBadgeName(achievement.badge_type)}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(achievement.awarded_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
} 