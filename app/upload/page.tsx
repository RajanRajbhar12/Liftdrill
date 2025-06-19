"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { 
  Video, Play, Square, RotateCcw, CheckCircle, AlertCircle, 
  Clock, Info, Timer, AlertTriangle, Loader2, Camera, 
  Mic, Settings, ChevronRight, ChevronLeft, Zap
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { submitVideo, getChallenge } from "@/lib/actions"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export default function UploadPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const challengeId = searchParams.get("challengeId")

  // Challenge state
  const [challenge, setChallenge] = useState<any>(null)
  const [score, setScore] = useState("")
  const [notes, setNotes] = useState("")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("record")

  // Recording states
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const [showInstructions, setShowInstructions] = useState(true)
  const [hasStartedRecording, setHasStartedRecording] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const playbackRef = useRef<HTMLVideoElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  // Load challenge data
  useEffect(() => {
    if (challengeId) {
      loadChallenge()
    } else {
      toast.error("No challenge selected", {
        description: "Please select a challenge first"
      })
      router.push("/challenges")
    }
  }, [challengeId])

  // Initialize camera
  useEffect(() => {
    if (challenge && !cameraReady && !cameraError) {
      initializeCamera()
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [challenge, cameraReady])

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: "user"
        }, 
        audio: true 
      })
      setStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraReady(true)
      setCameraError(null)
    } catch (error: any) {
      console.error("Camera initialization error:", error)
      setCameraError(error.message)
      toast.error("Camera access failed", {
        description: "Please check your camera permissions and try again"
      })
    }
  }

  const loadChallenge = async () => {
    if (!challengeId) return

    try {
      const challengeData = await getChallenge(challengeId)
      if (challengeData) {
        setChallenge(challengeData)
      } else {
        toast.error("Challenge not found", {
          description: "The selected challenge could not be found"
        })
        router.push("/challenges")
      }
    } catch (error) {
      console.error("Error loading challenge:", error)
      toast.error("Error loading challenge", {
        description: "Failed to load challenge details"
      })
    }
  }

  const startCountdown = () => {
    if (!cameraReady) {
      toast.error("Camera not ready", {
        description: "Please wait for camera initialization or check permissions"
      })
      return
    }

    setCountdown(10)
    setShowInstructions(false)
    
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current)
          startRecording()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const startRecording = async () => {
    if (!stream) return

    try {
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 2500000 // 2.5 Mbps
      })
      const chunks: BlobPart[] = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" })
        setRecordedBlob(blob)
        setRecordedUrl(URL.createObjectURL(blob))
        if (playbackRef.current) {
          playbackRef.current.src = URL.createObjectURL(blob)
        }
      }

      setMediaRecorder(recorder)
      recorder.start(1000) // Collect data every second
      setIsRecording(true)
      setHasStartedRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= (challenge?.video_duration_limit || 60)) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)

    } catch (error) {
      console.error("Error starting recording:", error)
      toast.error("Recording failed", {
        description: "Failed to start recording. Please try again."
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop()
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setIsRecording(false)
  }

  const resetRecording = () => {
    setRecordedBlob(null)
    setRecordedUrl(null)
    setRecordingTime(0)
    setHasStartedRecording(false)
    setShowInstructions(true)
    if (playbackRef.current) {
      playbackRef.current.src = ""
    }
    setActiveTab("record")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const submitRecording = async () => {
    if (!recordedBlob || !score || !challengeId) {
      toast.error("Missing information", {
        description: "Please provide both a recording and your score"
      })
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      const file = new File([recordedBlob], `recording-${Date.now()}.webm`, { type: "video/webm" })
      const formData = new FormData()
      formData.append("video", file)
      formData.append("challengeId", challengeId)
      formData.append("score", score)
      formData.append("notes", notes)

      const result = await submitVideo(formData)

      if (result.success) {
        toast.success("Video submitted successfully!")
        router.push(`/challenges/${challengeId}`)
      } else {
        throw new Error("Failed to submit video")
      }
    } catch (error: any) {
      toast.error("Submission failed", {
        description: error.message || "Failed to submit video"
      })
    } finally {
      setUploading(false)
    }
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading challenge details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Full Screen Recording Interface */}
      {activeTab === "record" ? (
        <div className="fixed inset-0 z-50 bg-black">
          {/* Video Preview - Full Screen */}
          <div className="relative w-full h-full">
            {!recordedUrl ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={playbackRef}
                controls
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Countdown Overlay */}
            {countdown > 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl md:text-9xl font-bold text-white mb-4 animate-pulse">
                    {countdown}
                  </div>
                  <p className="text-white text-xl md:text-2xl">Get ready!</p>
                </div>
              </div>
            )}

            {/* Recording Timer */}
            {isRecording && (
              <div className="absolute top-6 right-6 bg-red-600 text-white px-6 py-3 rounded-full font-bold shadow-lg text-lg md:text-xl">
                {formatTime(recordingTime)} / {formatTime(challenge.video_duration_limit)}
              </div>
            )}

            {/* Recording Progress */}
            {isRecording && (
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-gray-200/30">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-800 transition-all duration-1000"
                  style={{
                    width: `${(recordingTime / challenge.video_duration_limit) * 100}%`
                  }}
                />
              </div>
            )}

            {/* Camera Error */}
            {cameraError && (
              <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-6">
                <div className="text-center text-white">
                  <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
                  <h3 className="text-2xl font-bold mb-2">Camera Access Required</h3>
                  <p className="text-gray-300 mb-4 text-lg">{cameraError}</p>
                  <Button
                    onClick={initializeCamera}
                    variant="outline"
                    className="text-white border-white hover:bg-white/10 text-lg px-6 py-3"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {/* Top Controls */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/challenges/${challengeId}`)}
                className="text-white hover:bg-white/20 rounded-full p-3"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-black/50 text-white border-white/30">
                  <Camera className="h-4 w-4 mr-1" />
                  {cameraReady ? "Ready" : "Initializing..."}
                </Badge>
                <Badge variant="outline" className="bg-black/50 text-white border-white/30">
                  <Mic className="h-4 w-4 mr-1" />
                  Audio
                </Badge>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-8 left-4 right-4">
              {!recordedUrl ? (
                <div className="flex flex-col items-center gap-6">
                  <Button
                    onClick={isRecording ? stopRecording : startCountdown}
                    disabled={!cameraReady || uploading}
                    className={cn(
                      "w-20 h-20 rounded-full text-white shadow-2xl",
                      isRecording 
                        ? "bg-red-600 hover:bg-red-700" 
                        : "bg-blue-600 hover:bg-blue-700"
                    )}
                  >
                    {isRecording ? (
                      <Square className="h-8 w-8" />
                    ) : (
                      <Play className="h-8 w-8 ml-1" />
                    )}
                  </Button>
                  {!isRecording && (
                    <p className="text-white text-center text-lg">
                      Tap to start recording
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={resetRecording}
                    variant="outline"
                    className="bg-black/50 text-white border-white/30 hover:bg-white/20 px-8 py-3 text-lg"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Record Again
                  </Button>
                  <Button
                    onClick={() => setActiveTab("review")}
                    className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg"
                  >
                    <ChevronRight className="h-5 w-5 mr-2" />
                    Review & Submit
                  </Button>
                </div>
              )}
            </div>

            {/* Challenge Info Overlay */}
            <div className="absolute top-20 left-4 right-4">
              <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 text-white">
                <h2 className="text-xl font-bold mb-1">{challenge.title}</h2>
                <p className="text-gray-300 text-sm">{challenge.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {challenge.category}
                  </Badge>
                  <span className="text-sm">Duration: {challenge.video_duration_limit}s</span>
                </div>
              </div>
            </div>

            {/* Video Playback Controls Overlay - Only show when video is recorded */}
            {recordedUrl && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-32 left-4 right-4 pointer-events-auto">
                  <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 text-white text-center">
                    <p className="text-lg font-medium mb-2">Your Recording</p>
                    <p className="text-sm text-gray-300">Use the video controls to play/pause and review your recording</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Regular Layout for Review & Submit */
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/challenges/${challengeId}`)}
                className="hover:bg-transparent"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Challenge
              </Button>
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Record Your Attempt
            </h1>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-sm">
                {challenge.category}
              </Badge>
              <p className="text-gray-600">Duration: {challenge.video_duration_limit}s</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="record" disabled={!!recordedUrl}>Record</TabsTrigger>
                  <TabsTrigger value="review" disabled={!recordedUrl}>Review & Submit</TabsTrigger>
                </TabsList>

                <TabsContent value="record" className="space-y-6">
                  {/* Recording Studio Card */}
                  <Card className="border-0 shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-blue-900">
                            <Video className="h-5 w-5" />
                            Recording Studio
                          </CardTitle>
                          <CardDescription className="text-blue-700">
                            Record your attempt for {challenge.title}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Camera className="h-3 w-3" />
                            {cameraReady ? "Camera Ready" : "Initializing..."}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Mic className="h-3 w-3" />
                            Audio Enabled
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {/* Video Preview */}
                      <div className="relative">
                        <div className="aspect-video bg-black relative">
                          {!recordedUrl ? (
                            <video
                              ref={videoRef}
                              autoPlay
                              muted
                              playsInline
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video
                              ref={playbackRef}
                              controls
                              className="w-full h-full object-cover"
                            />
                          )}
                          
                          {/* Countdown Overlay */}
                          {countdown > 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-8xl font-bold text-white mb-4 animate-pulse">
                                  {countdown}
                                </div>
                                <p className="text-white text-lg">Get ready!</p>
                              </div>
                            </div>
                          )}

                          {/* Recording Timer */}
                          {isRecording && (
                            <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                              {formatTime(recordingTime)} / {formatTime(challenge.video_duration_limit)}
                            </div>
                          )}

                          {/* Recording Progress */}
                          {isRecording && (
                            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-200">
                              <div
                                className="h-full bg-gradient-to-r from-blue-600 to-blue-800 transition-all duration-1000"
                                style={{
                                  width: `${(recordingTime / challenge.video_duration_limit) * 100}%`
                                }}
                              />
                            </div>
                          )}

                          {/* Camera Error */}
                          {cameraError && (
                            <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-6">
                              <div className="text-center text-white">
                                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                                <h3 className="text-xl font-bold mb-2">Camera Access Required</h3>
                                <p className="text-gray-300 mb-4">{cameraError}</p>
                                <Button
                                  onClick={initializeCamera}
                                  variant="outline"
                                  className="text-white border-white hover:bg-white/10"
                                >
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Try Again
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Recording Controls */}
                        <div className="p-6 bg-gradient-to-b from-white to-gray-50">
                          {!recordedUrl ? (
                            <div className="flex flex-col gap-4">
                              <Button
                                onClick={isRecording ? stopRecording : startCountdown}
                                disabled={!cameraReady || uploading}
                                className={cn(
                                  "w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
                                  isRecording && "from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                                )}
                              >
                                {isRecording ? (
                                  <div className="flex items-center gap-2">
                                    <Square className="h-5 w-5" />
                                    Stop Recording
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Play className="h-5 w-5" />
                                    Start Recording
                                  </div>
                                )}
                              </Button>
                              {!isRecording && (
                                <p className="text-center text-sm text-gray-500">
                                  You'll have a 10-second countdown to get ready
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="flex gap-4">
                              <Button
                                onClick={resetRecording}
                                variant="outline"
                                className="flex-1 h-14"
                              >
                                <RotateCcw className="h-5 w-5 mr-2" />
                                Record Again
                              </Button>
                              <Button
                                onClick={() => setActiveTab("review")}
                                className="flex-1 h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                              >
                                <ChevronRight className="h-5 w-5 mr-2" />
                                Review & Submit
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Instructions Card */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-900">
                        <Info className="h-5 w-5" />
                        Recording Instructions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                              <Timer className="h-4 w-4" />
                              Recording Requirements
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-blue-700">
                              <li>Duration: {challenge.video_duration_limit} seconds</li>
                              <li>Format: WebM (HD quality)</li>
                              <li>Must show full body</li>
                              <li>Good lighting required</li>
                              <li>No editing allowed</li>
                            </ul>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                              <Zap className="h-4 w-4" />
                              Tips for Success
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-blue-700">
                              <li>Find a well-lit space</li>
                              <li>Use a stable camera setup</li>
                              <li>Wear appropriate workout attire</li>
                              <li>Clear the area of obstacles</li>
                              <li>Test your camera before recording</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="review" className="space-y-6">
                  {/* Review & Submit Card */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                      <CardTitle className="flex items-center gap-2 text-green-900">
                        <CheckCircle className="h-5 w-5" />
                        Review & Submit
                      </CardTitle>
                      <CardDescription className="text-green-700">
                        Review your recording and provide your score
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Video Preview */}
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <video
                          ref={playbackRef}
                          controls
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Submission Form */}
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="score" className="text-lg font-medium">Your Score *</Label>
                          <Input
                            id="score"
                            type="number"
                            placeholder="Enter your score"
                            value={score}
                            onChange={(e) => setScore(e.target.value)}
                            className="h-12 text-lg"
                            required
                          />
                          <p className="text-sm text-gray-500">
                            Enter your score based on {challenge.scoring_method}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="notes" className="text-lg font-medium">Additional Notes</Label>
                          <Textarea
                            id="notes"
                            placeholder="Any additional information about your attempt..."
                            className="min-h-[120px] text-lg"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                          />
                        </div>

                        <Separator />

                        <Button
                          onClick={submitRecording}
                          disabled={uploading || !score}
                          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                        >
                          {uploading ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Submitting...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5" />
                              Submit Video
                            </div>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Challenge Info Card */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Info className="h-5 w-5" />
                    Challenge Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{challenge.title}</h3>
                    <p className="text-gray-600">{challenge.description}</p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium">{challenge.category}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium">{challenge.video_duration_limit}s</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Entry Fee</p>
                      <p className="font-medium">₹{challenge.entry_fee}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Prize Pool</p>
                      <p className="font-medium">₹{challenge.prize_pool}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-900">Scoring Method</h4>
                    <p className="text-gray-600">{challenge.scoring_method}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-900">Rules</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {Array.isArray(challenge.rules) 
                        ? challenge.rules.map((rule: string, index: number) => (
                            <li key={index}>{rule}</li>
                          ))
                        : typeof challenge.rules === 'string' 
                          ? challenge.rules.split('\n').map((rule: string, index: number) => (
                              <li key={index}>{rule}</li>
                            ))
                          : null
                      }
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
