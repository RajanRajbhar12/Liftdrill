"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Clock, IndianRupee, Video, Award, Share2, Play, CheckCircle, AlertCircle, Trophy, Star, Gift, Loader2, Users, Calendar, ChevronLeft, Flag, PlusCircle, Info, Upload, UserPlus } from 'lucide-react'
import { getChallenge, joinChallenge, processPayment, hasSubmittedVideo, submitVideo } from "@/lib/actions"
import { getCurrentUser } from "@/lib/auth"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Define proper TypeScript interfaces
interface PrizeDistribution {
  rank: string
  amount: number
  percentage: number
}

interface Challenge {
  id: number
  title: string
  description: string
  category: string
  entryFee: number
  prizePool: number
  startDate: string
  endDate: string
  status: "active" | "upcoming" | "completed"
  participants_count: number
  maxParticipants?: number
  daysLeft: number
  isNew?: boolean
  isEndingSoon?: boolean
  rules: string[]
  prizeDistribution: PrizeDistribution[]
  created_by: string
  created_at: string
  submissions_count: number
  is_joined: boolean
  has_submitted: boolean
  scoring_method: string
  video_duration_limit: number
  prize_distribution: string
  end_date: string
  entry_fee: number
  long_description: string
}

interface User {
  id: string
  name?: string
  email?: string
}

interface Submission {
  id: string
  user_id: string
  challenge_id: string
  video_url: string
  status: "pending" | "approved" | "rejected"
  created_at: string
}

interface PaymentResult {
  success: boolean
  error?: string
  paymentIntent?: {
    id: string
    amount: number
    currency: string
    status: string
  }
}

interface SubmissionResult {
  success: boolean
  error?: string
  submissionId?: string
}

function PrizeDistribution({ distribution }: { distribution: PrizeDistribution[] }) {
  if (!distribution || distribution.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-xl">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Trophy className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-grow">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-blue-900 tracking-tight">No prizes set</span>
            </div>
            <p className="text-sm text-blue-600">Prize distribution will be updated soon.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {distribution.map((prize, index) => (
        <div key={index} className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-xl">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Trophy className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-grow">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-blue-900 tracking-tight">{prize.rank}</span>
              <span className="text-lg font-bold text-blue-700">₹{prize.amount.toLocaleString()}</span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${prize.percentage}%` }}
              />
            </div>
            <span className="text-sm text-blue-600 mt-1 block">{prize.percentage}% of prize pool</span>
          </div>
        </div>
      ))}
    </div>
  )
}

interface ChallengePageProps {
  params: { id: string }
}

export default function ChallengePage({ params }: ChallengePageProps) {
  const challengeId = params.id
  const router = useRouter()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isJoining, setIsJoining] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showVideoDialog, setShowVideoDialog] = useState(false)
  const [videoUrl, setVideoUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [hasJoined, setHasJoined] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false)
  const [submitStep, setSubmitStep] = useState(1)
  const [score, setScore] = useState('')
  const [notes, setNotes] = useState('')
  
  useEffect(() => {
    const loadChallenge = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)
        const data = await getChallenge(challengeId)
        setChallenge(data)
        if (data) {
          setHasJoined(data.is_joined)
          setHasSubmitted(data.has_submitted)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load challenge")
      } finally {
        setLoading(false)
      }
    }

    loadChallenge()
  }, [challengeId])

  const handleJoinChallenge = async () => {
    if (!challenge) return

    setIsJoining(true)
    try {
      if (!currentUser) {
        toast.error("Please log in to join this challenge")
        setIsJoining(false)
        return
      }

      // Check if user has already joined
      if (hasJoined) {
        toast.error("You have already joined this challenge")
        setIsJoining(false)
        return
      }

      // Check if challenge is full
      if (challenge.maxParticipants && challenge.participants_count >= challenge.maxParticipants) {
        toast.error("This challenge has reached its maximum number of participants")
        setIsJoining(false)
        return
      }

      // Check if challenge has ended
      if (new Date(challenge.endDate) < new Date()) {
        toast.error("This challenge has ended")
        setIsJoining(false)
        return
      }

      // If there's an entry fee, show payment dialog
      if (challenge.entryFee > 0) {
        setIsJoinDialogOpen(true)
        setIsJoining(false)
        return
      }

      // Join the challenge
      const result = await joinChallenge(challenge.id.toString())
      if (result.success) {
        toast.success("Successfully joined the challenge!")
        setHasJoined(true)
        // Refresh challenge data
        const updatedChallenge = await getChallenge(challengeId)
        setChallenge(updatedChallenge)
      } else {
        toast.error(result.error || "Failed to join challenge")
      }
    } catch (error) {
      console.error("Error joining challenge:", error)
      toast.error("Failed to join challenge")
    } finally {
      setIsJoining(false)
    }
  }

  const handlePayment = async () => {
    if (!currentUser || !challenge) {
      toast.error("Please sign in to join the challenge")
      return
    }

    setIsProcessingPayment(true)
    try {
      // First try to join the challenge (this will check wallet balance and process payment)
      const joinResult = await joinChallenge(challenge.id.toString())
      
      if (joinResult.success) {
        toast.success("Successfully joined the challenge!")
        setIsJoinDialogOpen(false)
        // Refresh the page to update the UI
        window.location.reload()
      } else {
        if (joinResult.error === "Insufficient wallet balance") {
          toast.error("Insufficient wallet balance. Please add funds to your wallet.")
          // Optionally redirect to wallet page
          router.push('/wallet')
        } else {
          toast.error(joinResult.error || "Failed to join challenge")
        }
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("An error occurred during payment. Please try again.")
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handleSubmitVideo = async () => {
    if (!challenge || !videoUrl || !score) return

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('challengeId', challenge.id.toString())
      formData.append('videoUrl', videoUrl)
      formData.append('score', score)
      formData.append('notes', notes)
      const result = await submitVideo(formData) as SubmissionResult
      if (result.success) {
        toast.success("Video submitted successfully!")
        setIsSubmitDialogOpen(false)
        setHasSubmitted(true)
        // Refresh the page to update the UI
        window.location.reload()
      } else {
        toast.error(result.error || "Failed to submit video")
      }
    } catch (error) {
      console.error("Error submitting video:", error)
      toast.error("Failed to submit video. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading challenge details...</p>
        </div>
      </div>
    )
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Challenge</h2>
          <p className="text-gray-600">{error || "Challenge not found"}</p>
          <Button
            onClick={() => router.push("/challenges")}
            className="mt-4 bg-blue-600 hover:bg-blue-700"
          >
            Back to Challenges
          </Button>
        </div>
      </div>
    )
  }

  // Calculate time progress with safety check
  const timeProgress = Math.min(100, Math.max(0, 100 - (challenge.daysLeft / 30) * 100))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white font-['Inter']">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section with Challenge Info */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-grow">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-white/20 text-white border-0 font-medium px-3 py-1">{challenge.category}</Badge>
                {challenge.isNew && <Badge className="bg-green-500/20 text-green-100 border-0 font-medium px-3 py-1">New Challenge</Badge>}
                {challenge.isEndingSoon && <Badge className="bg-yellow-500/20 text-yellow-100 border-0 font-medium px-3 py-1">Ending Soon</Badge>}
                <Badge className="bg-blue-500/20 text-blue-100 border-0 font-medium px-3 py-1">{challenge.scoring_method}</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">{challenge.title}</h1>
              <p className="text-blue-100 text-lg mb-6 max-w-3xl">{challenge.description}</p>
              
              {/* Challenge Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-blue-100 mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Duration</span>
                  </div>
                  <div className="text-white font-semibold">{challenge.video_duration_limit} seconds</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-blue-100 mb-1">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">Participants</span>
                  </div>
                  <div className="text-white font-semibold">
                    {challenge.participants_count}
                    {challenge.maxParticipants && ` / ${challenge.maxParticipants}`}
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-blue-100 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">End Date</span>
                  </div>
                  <div className="text-white font-semibold">
                    {new Date(challenge.end_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-white mb-1">₹{challenge.prizePool}</div>
                <div className="text-blue-200 font-medium">Total Prize Pool</div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-white">
                  <span className="font-medium">Entry Fee</span>
                  <span className="font-bold">₹{challenge.entry_fee}</span>
                </div>
                <div className="flex justify-between items-center text-white">
                  <span className="font-medium">Participants</span>
                  <span className="font-bold">{challenge.participants_count}</span>
                </div>
                {challenge.maxParticipants && (
                  <div className="flex justify-between items-center text-white">
                    <span className="font-medium">Max Participants</span>
                    <span className="font-bold">{challenge.maxParticipants}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-white">
                  <span className="font-medium">Prize Distribution</span>
                  <span className="font-bold capitalize">{challenge.prize_distribution.replace(/_/g, ' ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start border-b border-gray-200 bg-transparent p-0">
                <TabsTrigger
                  value="details"
                  className="data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="rules"
                  className="data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                >
                  Rules
                </TabsTrigger>
                <TabsTrigger
                  value="leaderboard"
                  className="data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                >
                  Leaderboard
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6 mt-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-blue-600" />
                      Challenge Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-blue max-w-none">
                      <div className="text-blue-700 space-y-4">
                        {challenge.long_description ? (
                          challenge.long_description.split('\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                          ))
                        ) : (
                          <p>{challenge.description}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      How to Participate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside space-y-3 text-gray-700">
                      <li>
                        {`Pay the entry fee of ₹${(challenge.entry_fee || 0).toLocaleString()} to join the challenge`}
                      </li>
                      <li>Record your attempt following all the rules</li>
                      <li>Upload your video before the challenge end date</li>
                      <li>Your video must be {challenge.video_duration_limit} seconds or less</li>
                      <li>Winners will be determined based on {challenge.scoring_method}</li>
                    </ol>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-blue-600" />
                      Prize Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {challenge.prize_distribution === 'winner_takes_all' && (
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-3">
                            <Trophy className="h-6 w-6 text-yellow-500" />
                            <span className="font-medium">1st Place</span>
                          </div>
                          <span className="font-bold text-lg">₹{Math.round(challenge.prizePool).toLocaleString()}</span>
                        </div>
                      )}
                      {challenge.prize_distribution === 'top_3_split' && (
                        <>
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-3">
                              <Trophy className="h-6 w-6 text-yellow-500" />
                              <span className="font-medium">1st Place</span>
                            </div>
                            <span className="font-bold text-lg">₹{Math.round(challenge.prizePool * 0.5).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-3">
                              <Trophy className="h-6 w-6 text-gray-400" />
                              <span className="font-medium">2nd Place</span>
                            </div>
                            <span className="font-bold text-lg">₹{Math.round(challenge.prizePool * 0.3).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-3">
                              <Trophy className="h-6 w-6 text-amber-600" />
                              <span className="font-medium">3rd Place</span>
                            </div>
                            <span className="font-bold text-lg">₹{Math.round(challenge.prizePool * 0.2).toLocaleString()}</span>
                          </div>
                        </>
                      )}
                      {challenge.prize_distribution === 'top_5_split' && (
                        <>
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-3">
                              <Trophy className="h-6 w-6 text-yellow-500" />
                              <span className="font-medium">1st Place</span>
                            </div>
                            <span className="font-bold text-lg">₹{Math.round(challenge.prizePool * 0.4).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-3">
                              <Trophy className="h-6 w-6 text-gray-400" />
                              <span className="font-medium">2nd Place</span>
                            </div>
                            <span className="font-bold text-lg">₹{Math.round(challenge.prizePool * 0.25).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-3">
                              <Trophy className="h-6 w-6 text-amber-600" />
                              <span className="font-medium">3rd Place</span>
                            </div>
                            <span className="font-bold text-lg">₹{Math.round(challenge.prizePool * 0.15).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-3">
                              <Trophy className="h-6 w-6 text-blue-600" />
                              <span className="font-medium">4th Place</span>
                            </div>
                            <span className="font-bold text-lg">₹{Math.round(challenge.prizePool * 0.1).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-3">
                              <Trophy className="h-6 w-6 text-blue-600" />
                              <span className="font-medium">5th Place</span>
                            </div>
                            <span className="font-bold text-lg">₹{Math.round(challenge.prizePool * 0.1).toLocaleString()}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* User Submission Video Replay */}
                {hasSubmitted && videoUrl && (
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Play className="h-5 w-5 text-blue-600" />
                        Your Submission
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-full max-w-xl aspect-video rounded-lg overflow-hidden border border-blue-200 bg-black">
                          <video
                            src={videoUrl}
                            controls
                            className="w-full h-full object-contain bg-black"
                          >
                            Sorry, your browser does not support embedded videos.
                          </video>
                        </div>
                        <div className="text-sm text-blue-700 text-center">
                          You can replay your submitted video here. If you want to update your submission, please contact support.
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="rules" className="mt-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      Challenge Rules
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {challenge.rules && challenge.rules.length > 0 ? (
                      <ul className="space-y-4">
                        {challenge.rules.map((rule, index) => (
                          <li key={index} className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-sm font-bold">{index + 1}</span>
                            </div>
                            <span className="text-gray-700 leading-relaxed">{rule}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No specific rules defined for this challenge.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="leaderboard" className="mt-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-blue-600" />
                      Current Standings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <Trophy className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No submissions yet</h3>
                      <p className="text-gray-600 mb-4">Be the first to submit your attempt!</p>
                      {hasJoined && (
                        <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-800">
                          <Link href={`/upload?challengeId=${challenge.id}`}>Submit Your Video</Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Challenge Info */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Challenge Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-700">Prize Pool</span>
                  <span className="font-bold text-xl text-blue-600">₹{(challenge?.prizePool || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-700">Entry Fee</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">
                      ₹{(challenge?.entry_fee || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-700">Participants</span>
                  <span className="font-bold">{challenge?.participants_count || 0}</span>
                </div>
                {challenge.maxParticipants && (
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-700">Max Participants</span>
                    <span className="font-bold">{challenge.maxParticipants}</span>
                  </div>
                )}
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-700">Scoring Method</span>
                  <span className="font-bold capitalize">{challenge.scoring_method}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-700">Video Duration</span>
                  <span className="font-bold">{challenge.video_duration_limit} seconds</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-700">End Date</span>
                  <span className="font-bold">{challenge?.end_date ? new Date(challenge.endDate).toLocaleDateString() : 'No end date set'}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">Time Remaining</span>
                    </div>
                    <span className="font-bold text-blue-600">{challenge.daysLeft || 0} days</span>
                  </div>
                  <Progress value={timeProgress} className="h-3 bg-gray-200" />
                </div>
              </CardContent>
            </Card>

            {/* Creator Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Challenge Creator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg?height=48&width=48" alt="Creator" />
                    <AvatarFallback>AC</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">Alex Chen</div>
                    <div className="text-sm text-gray-500">@alexchen • Fitness Coach</div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-600">4.9 rating</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Intermediate
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">1 minute</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Equipment</span>
                  <span className="font-medium">None</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-medium text-blue-600">78%</span>
                </div>
              </CardContent>
            </Card>

            {/* Join Challenge Dialog */}
            <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
              <DialogContent className="sm:max-w-md rounded-xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-blue-900 tracking-tight">Join Challenge</DialogTitle>
                  <DialogDescription className="text-blue-700">
                    Ready to take on this challenge? Pay the entry fee to join and start competing!
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="bg-blue-50/50 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-blue-900">Entry Fee</span>
                      <span className="text-xl font-bold text-blue-700">₹{challenge.entry_fee}</span>
                    </div>
                    <p className="text-sm text-blue-600">This amount will be added to the prize pool.</p>
                  </div>
                  <div className="bg-blue-50/50 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-blue-900">Current Prize Pool</span>
                      <span className="text-xl font-bold text-blue-700">₹{challenge.prizePool}</span>
                    </div>
                    <p className="text-sm text-blue-600">Total amount to be won by participants.</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessingPayment}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-lg py-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-colors"
                  >
                    {isProcessingPayment ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing Payment...
                      </div>
                    ) : (
                      `Pay ₹${challenge.entry_fee} to Join`
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Prize Distribution */}
            <PrizeDistribution distribution={challenge?.prizeDistribution || []} />
          </div>
        </div>
      </div>

      {/* Submit Video Dialog - Redesigned as Stepper */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={(open) => { setIsSubmitDialogOpen(open); setSubmitStep(1); }}>
        <DialogContent className="sm:max-w-2xl rounded-xl p-0 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Main Content */}
            <div className="flex-1 p-6 md:p-8 bg-white">
              {/* Stepper Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-white ${submitStep === 1 ? 'bg-blue-600' : 'bg-blue-300'}`}>1</div>
                <span className={`font-semibold ${submitStep === 1 ? 'text-blue-700' : 'text-gray-400'}`}>Record</span>
                <div className="h-1 w-8 bg-blue-200 rounded-full mx-2" />
                <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-white ${submitStep === 2 ? 'bg-blue-600' : 'bg-blue-300'}`}>2</div>
                <span className={`font-semibold ${submitStep === 2 ? 'text-blue-700' : 'text-gray-400'}`}>Review & Submit</span>
              </div>
              {/* Step 1: Record/Upload */}
              {submitStep === 1 && (
                <div>
                  <h2 className="text-xl font-bold text-blue-900 mb-2">Record Your Attempt</h2>
                  <p className="text-gray-700 mb-4">Paste your video URL (YouTube/Vimeo) below. Make sure your video is clear and follows all challenge rules.</p>
                  <Label htmlFor="videoUrl" className="text-blue-900 font-medium">Video URL</Label>
                  <Input
                    id="videoUrl"
                    placeholder="Paste your video URL here (YouTube/Vimeo)"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="rounded-lg border-blue-200 focus:border-blue-400 mb-2"
                    autoComplete="off"
                  />
                  <Button
                    onClick={() => setSubmitStep(2)}
                    disabled={!videoUrl}
                    className="mt-4 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-lg py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-colors disabled:opacity-50"
                  >
                    Review & Submit
                  </Button>
                </div>
              )}
              {/* Step 2: Review & Submit */}
              {submitStep === 2 && (
                <div>
                  <h2 className="text-xl font-bold text-blue-900 mb-2">Review & Submit</h2>
                  <p className="text-gray-700 mb-4">Review your recording and provide your score before submitting.</p>
                  {/* Video Preview */}
                  <div className="w-full max-w-xl aspect-video rounded-lg overflow-hidden border border-blue-200 bg-black mb-4 mx-auto">
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-full object-contain bg-black"
                    >
                      Sorry, your browser does not support embedded videos.
                    </video>
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="score" className="text-blue-900 font-medium">Your Score *</Label>
                    <Input
                      id="score"
                      type="number"
                      min="0"
                      placeholder="Enter your score based on rep count"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      className="rounded-lg border-blue-200 focus:border-blue-400 mt-1"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="notes" className="text-blue-900 font-medium">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional information about your attempt..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="rounded-lg border-blue-200 focus:border-blue-400 mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSubmitStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmitVideo}
                      disabled={isSubmitting || !videoUrl || !score}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-lg py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Submitting...
                        </div>
                      ) : (
                        'Submit Video'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            {/* Sidebar: Challenge Details */}
            <div className="w-full md:w-80 bg-blue-50 p-6 flex flex-col gap-4 border-l border-blue-100">
              <h3 className="text-lg font-bold text-blue-900 mb-2">Challenge Details</h3>
              <div className="mb-2">
                <div className="font-semibold text-blue-800 text-base mb-1">{challenge.title}</div>
                <div className="text-gray-700 text-sm mb-2 line-clamp-3">{challenge.description}</div>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Category</span><span className="font-medium text-blue-700">{challenge.category}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Duration</span><span className="font-medium text-blue-700">{challenge.video_duration_limit}s</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Entry Fee</span><span className="font-medium text-blue-700">₹{challenge.entry_fee}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Prize Pool</span><span className="font-medium text-blue-700">₹{challenge.prizePool}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Scoring Method</span><span className="font-medium text-blue-700">{challenge.scoring_method}</span></div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}