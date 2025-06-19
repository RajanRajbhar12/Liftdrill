"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Trophy, Medal, Crown, Star, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getGlobalLeaderboard } from "@/lib/actions"
import { toast } from "sonner"

// Leaderboard data structure
interface LeaderboardEntry {
  id: string;
  user_id: string;
  name: string;
  username: string;
  avatar_url?: string;
  score: number;
  rank: number;
  achievements: number;
  challenges_completed: number;
}

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    loadLeaderboardData();
  }, []);

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);
      const data = await getGlobalLeaderboard();
      setLeaderboardData(data);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
      toast.error("Failed to load leaderboard data");
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Global Leaderboard</h1>
            <p className="text-gray-600">See where you rank among the top fitness enthusiasts on LiftDrill</p>
          </div>
          <Button 
            onClick={loadLeaderboardData}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Refresh Leaderboard
          </Button>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-blue-800" />
          </div>
        ) : leaderboardData.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-xl border-0 rounded-2xl">
              <CardContent className="pt-6 text-center text-gray-500">
                No leaderboard data available yet. Be the first to join a challenge!
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-xl border-0 rounded-2xl">
              <CardHeader className="bg-gradient-to-br from-blue-800 to-indigo-800 text-white">
                <CardTitle className="text-2xl">Top Fitness Enthusiasts</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {leaderboardData.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {entry.rank <= 3 ? (
                            <div className="absolute -top-2 -right-2">
                              {getRankIcon(entry.rank)}
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                              {entry.rank}
                            </div>
                          )}
                          <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                            <AvatarImage src={entry.avatar_url} alt={entry.name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-800 to-indigo-800 text-white">
                              {entry.name?.[0] || entry.username?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{entry.name}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>@{entry.username}</span>
                            <div className="flex items-center gap-1">
                              <Trophy className="h-4 w-4 text-yellow-600" />
                              <span>{entry.achievements} achievements</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-blue-600" />
                              <span>{entry.challenges_completed} completed</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-800">{entry.score}</div>
                        <div className="text-sm text-gray-500">points</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
} 