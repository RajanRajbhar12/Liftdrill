"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { getChallenges, joinChallenge } from "@/lib/actions"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Search, PlusCircle, Trophy, Users, Calendar, Info, DollarSign, Award, IndianRupee, ChevronRight, Filter, X, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { getCurrentUser } from "@/lib/auth"
import { cn } from "@/lib/utils"

interface Challenge {
  id: string
  title: string
  description: string
  category: string
  entry_fee: number
  prize_pool: number
  end_date: string
  participants_count: number
  created_at: string
  status: string
  isNew: boolean
  isEndingSoon: boolean
  daysLeft: number
  max_participants: number
  is_joined: boolean
}

export default function ChallengesPage() {
  const router = useRouter()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  useEffect(() => {
    loadChallenges()
    loadCurrentUser()
  }, [])

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser()
      setCurrentUser(user)
    } catch (error) {
      console.error("Error loading current user:", error)
    }
  }

  const loadChallenges = async () => {
    try {
      const data = await getChallenges()
      setChallenges(data)
    } catch (error) {
      console.error("Error loading challenges:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredChallenges = challenges
    .filter((challenge) => {
      const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = category === "all" || challenge.category === category
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "prize":
          return b.prize_pool - a.prize_pool
        case "participants":
          return b.participants_count - a.participants_count
        default:
          return 0
      }
    })

  const handleJoinClick = (challenge: Challenge) => {
    if (!currentUser) {
      toast.error("Please log in to join challenges")
      router.push('/login')
      return
    }

    if (challenge.is_joined) {
      toast.error("You have already joined this challenge")
      return
    }

    if (challenge.max_participants && challenge.participants_count >= challenge.max_participants) {
      toast.error("This challenge has reached its maximum number of participants")
      return
    }

    if (new Date(challenge.end_date) < new Date()) {
      toast.error("This challenge has ended")
      return
    }

    setSelectedChallenge(challenge)
    setIsJoinDialogOpen(true)
  }

  const handleJoinChallenge = async () => {
    if (!selectedChallenge || !currentUser) return

    setIsProcessingPayment(true)
    try {
      const result = await joinChallenge(selectedChallenge.id)
      
      if (result.success) {
        toast.success("Successfully joined the challenge!")
        setIsJoinDialogOpen(false)
        // Redirect to challenge details page
        router.push(`/challenges/${selectedChallenge.id}`)
      } else {
        if (result.error === "Insufficient wallet balance") {
          toast.error("Insufficient wallet balance. Please add funds to your wallet.")
          router.push('/wallet')
        } else {
          toast.error(result.error || "Failed to join challenge")
        }
      }
    } catch (error) {
      console.error("Error joining challenge:", error)
      toast.error("An error occurred while joining the challenge")
    } finally {
      setIsProcessingPayment(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading challenges...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-r from-indigo-900 to-blue-800 py-12 px-4 rounded-2xl mb-8 shadow-xl flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Win Cash & Prizes with Fitness Challenges!</h1>
        <p className="text-lg text-indigo-100 max-w-2xl mb-6">Join exciting fitness challenges, compete with others, and win real rewards. Pay the entry fee, complete the challenge, and climb the leaderboard. It's that simple!</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center gap-2 text-white text-lg font-semibold border border-white/20"><Trophy className="h-6 w-6 text-yellow-300" /> Win Cash</div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center gap-2 text-white text-lg font-semibold border border-white/20"><Users className="h-6 w-6 text-indigo-200" /> Compete</div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center gap-2 text-white text-lg font-semibold border border-white/20"><Award className="h-6 w-6 text-emerald-200" /> Earn Badges</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search challenges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="cardio">Cardio</SelectItem>
                <SelectItem value="flexibility">Flexibility</SelectItem>
                <SelectItem value="endurance">Endurance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="prize">Highest Prize</SelectItem>
                <SelectItem value="participants">Most Participants</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* HOW IT WORKS SECTION */}
        <div className="w-full max-w-3xl mx-auto mb-10">
          <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-indigo-900 text-2xl font-bold flex items-center gap-2"><Info className="h-5 w-5 text-indigo-600" /> How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-indigo-900 text-lg">
                <li>Browse and join a challenge that excites you.</li>
                <li>Pay the entry fee to enter the prize pool.</li>
                <li>Complete the challenge and submit your video.</li>
                <li>Climb the leaderboard and win prizes!</li>
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => (
            <Card key={challenge.id} className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              {/* Prize Pool Banner */}
              <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-4 py-1 rounded-bl-lg font-bold text-lg">
                ₹{challenge.prize_pool.toLocaleString()}
              </div>

              <CardContent className="p-6">
                {/* Challenge Content */}
                <div className="space-y-4">
                  {/* Title and Category */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{challenge.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {challenge.category}
                      </Badge>
                      {challenge.isNew && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          New
                        </Badge>
                      )}
                      {challenge.isEndingSoon && (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          Ending Soon
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 line-clamp-2">{challenge.description}</p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">Participants</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-gray-900">{challenge.participants_count}</span>
                        {challenge.max_participants && (
                          <span className="text-sm text-gray-500">/ {challenge.max_participants}</span>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm">Entry Fee</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">₹{challenge.entry_fee}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {challenge.max_participants && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Filled Slots</span>
                        <span className="text-gray-900 font-medium">
                          {Math.round((challenge.participants_count / challenge.max_participants) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(challenge.participants_count / challenge.max_participants) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Time Remaining */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{challenge.daysLeft} days left</span>
                    <span className="text-gray-400">•</span>
                    <span>Ends {new Date(challenge.end_date).toLocaleDateString()}</span>
                  </div>

                  {/* Join Button */}
                  <Button 
                    onClick={() => handleJoinClick(challenge)}
                    className={cn(
                      "w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-6 rounded-xl text-lg transition-all duration-300 transform hover:scale-[1.02]",
                      challenge.is_joined && "bg-green-600 hover:bg-green-700 cursor-not-allowed"
                    )}
                    disabled={challenge.is_joined}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {challenge.is_joined ? (
                        <>
                          <CheckCircle className="h-5 w-5" />
                          <span>Joined</span>
                        </>
                      ) : (
                        <>
                          <span>Join Now</span>
                          <ChevronRight className="h-5 w-5" />
                        </>
                      )}
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredChallenges.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No challenges found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
            <Button asChild variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
              <Link href="/create-challenge">Create a Challenge</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Join Challenge Dialog */}
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-900 tracking-tight">Join Challenge</DialogTitle>
            <DialogDescription className="text-blue-700">
              Ready to take on this challenge? Pay the entry fee to join and start competing!
            </DialogDescription>
          </DialogHeader>
          {selectedChallenge && (
            <div className="space-y-4 py-4">
              <div className="bg-blue-50/50 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-blue-900">Entry Fee</span>
                  <span className="text-xl font-bold text-blue-700">₹{selectedChallenge.entry_fee}</span>
                </div>
                <p className="text-sm text-blue-600">This amount will be added to the prize pool.</p>
              </div>
              <div className="bg-blue-50/50 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-blue-900">Current Prize Pool</span>
                  <span className="text-xl font-bold text-blue-700">₹{selectedChallenge.prize_pool}</span>
                </div>
                <p className="text-sm text-blue-600">Total amount to be won by participants.</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={handleJoinChallenge}
              disabled={isProcessingPayment}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-lg py-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-colors"
            >
              {isProcessingPayment ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing Payment...
                </div>
              ) : (
                selectedChallenge && `Pay ₹${selectedChallenge.entry_fee} to Join`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
