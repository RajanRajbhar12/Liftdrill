"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createChallenge } from "@/lib/actions"
import { toast } from "sonner"
import { Loader2, PlusCircle, Trophy, Calendar, Users, AlertCircle, Info, IndianRupee, Clock, Video, Award, Settings } from 'lucide-react'
import Link from "next/link"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ChallengeFormData {
  title: string
  description: string
  longDescription: string
  category: string
  entryFee: number
  startDate: Date
  endDate: Date
  maxParticipants: string
  scoringMethod: string
  videoDurationLimit: number
  prizeDistribution: string
  isPublic: boolean
  rules: string[]
}

const CATEGORIES = [
  "Strength",
  "Endurance",
  "Flexibility",
  "Cardio",
  "HIIT",
  "Yoga",
  "CrossFit",
  "Weightlifting",
  "Bodyweight",
  "Other"
]

const SCORING_METHODS = [
  "Rep Count",
  "Time",
  "Weight",
  "Distance",
  "Form Score",
  "Custom"
]

export default function CreateChallengePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ChallengeFormData>({
    title: "",
    description: "",
    longDescription: "",
    category: "",
    entryFee: 0,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now
    maxParticipants: "",
    scoringMethod: "Rep Count",
    videoDurationLimit: 60,
    prizeDistribution: "top_3_split",
    isPublic: true,
    rules: []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [estimatedPrizePool, setEstimatedPrizePool] = useState(0)

  useEffect(() => {
    // Calculate estimated prize pool based on entry fee and max participants
    const maxParticipants = parseInt(formData.maxParticipants) || 100
    const platformFee = formData.entryFee * 0.1 // 10% platform fee
    const netEntryFee = formData.entryFee - platformFee
    setEstimatedPrizePool(netEntryFee * maxParticipants)
  }, [formData.entryFee, formData.maxParticipants])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    } else if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    } else if (formData.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters"
    }

    if (!formData.category) {
      newErrors.category = "Category is required"
    }

    if (formData.entryFee < 0) {
      newErrors.entryFee = "Entry fee cannot be negative"
    }

    if (formData.endDate <= formData.startDate) {
      newErrors.endDate = "End date must be after start date"
    }

    if (formData.maxParticipants && parseInt(formData.maxParticipants) < 2) {
      newErrors.maxParticipants = "Minimum 2 participants required"
    }

    if (formData.videoDurationLimit < 10 || formData.videoDurationLimit > 300) {
      newErrors.videoDurationLimit = "Video duration must be between 10 and 300 seconds"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user makes a selection
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleDateChange = (name: 'startDate' | 'endDate', date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, [name]: date }))
      // Clear error when user selects a date
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: "" }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    setLoading(true)
    try {
      const formDataObj = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof Date) {
          formDataObj.append(key, value.toISOString())
        } else if (typeof value === 'boolean') {
          formDataObj.append(key, value.toString())
        } else {
          formDataObj.append(key, value.toString())
        }
      })

      await createChallenge(formDataObj)
      toast.success("Challenge created successfully!")
      router.push("/challenges")
    } catch (error: any) {
      console.error("Error creating challenge:", error)
      toast.error(error.message || "Failed to create challenge")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <Card className="border-0 shadow-xl rounded-2xl">
          <CardHeader className="bg-gradient-to-br from-blue-800 to-indigo-800 text-white rounded-t-2xl">
            <CardTitle className="text-3xl font-bold">Create New Challenge</CardTitle>
            <CardDescription className="text-blue-100">
              Set up a fitness challenge and start competing with others
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-gray-700">Challenge Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter a catchy title"
                      className={cn("rounded-xl", errors.title && "border-red-500")}
                    />
                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-gray-700">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                      <SelectTrigger id="category" className={cn("rounded-xl", errors.category && "border-red-500")}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(category => (
                          <SelectItem key={category} value={category.toLowerCase()}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-700">Short Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Briefly describe your challenge..."
                    className={cn("rounded-xl min-h-[100px]", errors.description && "border-red-500")}
                  />
                  {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longDescription" className="text-gray-700">Detailed Description</Label>
                  <Textarea
                    id="longDescription"
                    name="longDescription"
                    value={formData.longDescription}
                    onChange={handleInputChange}
                    placeholder="Provide detailed instructions, rules, and requirements..."
                    className="rounded-xl min-h-[150px]"
                  />
                </div>
              </div>

              {/* Challenge Settings */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Challenge Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="entryFee" className="text-gray-700 flex items-center gap-2">
                      Entry Fee
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>10% platform fee will be deducted from each entry</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        id="entryFee"
                        name="entryFee"
                        type="number"
                        value={formData.entryFee}
                        onChange={handleInputChange}
                        className={cn("pl-8 rounded-xl", errors.entryFee && "border-red-500")}
                        min="0"
                        placeholder="0"
                      />
                    </div>
                    {errors.entryFee && <p className="text-sm text-red-500">{errors.entryFee}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants" className="text-gray-700">Maximum Participants</Label>
                    <Input
                      id="maxParticipants"
                      name="maxParticipants"
                      type="number"
                      value={formData.maxParticipants}
                      onChange={handleInputChange}
                      className={cn("rounded-xl", errors.maxParticipants && "border-red-500")}
                      min="2"
                      placeholder="Unlimited"
                    />
                    {errors.maxParticipants && <p className="text-sm text-red-500">{errors.maxParticipants}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-gray-700">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal rounded-xl",
                            !formData.startDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={formData.startDate}
                          onSelect={(date) => handleDateChange('startDate', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-gray-700">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal rounded-xl",
                            !formData.endDate && "text-muted-foreground",
                            errors.endDate && "border-red-500"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {formData.endDate ? format(formData.endDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={formData.endDate}
                          onSelect={(date) => handleDateChange('endDate', date)}
                          initialFocus
                          disabled={(date) => date <= formData.startDate}
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scoringMethod" className="text-gray-700">Scoring Method</Label>
                    <Select value={formData.scoringMethod} onValueChange={(value) => handleSelectChange('scoringMethod', value)}>
                      <SelectTrigger id="scoringMethod" className="rounded-xl">
                        <SelectValue placeholder="Select scoring method" />
                      </SelectTrigger>
                      <SelectContent>
                        {SCORING_METHODS.map(method => (
                          <SelectItem key={method} value={method.toLowerCase()}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="videoDurationLimit" className="text-gray-700 flex items-center gap-2">
                      Video Duration Limit (seconds)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Maximum allowed duration for submission videos</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input
                      id="videoDurationLimit"
                      name="videoDurationLimit"
                      type="number"
                      value={formData.videoDurationLimit}
                      onChange={handleInputChange}
                      className={cn("rounded-xl", errors.videoDurationLimit && "border-red-500")}
                      min="10"
                      max="300"
                    />
                    {errors.videoDurationLimit && <p className="text-sm text-red-500">{errors.videoDurationLimit}</p>}
                  </div>
                </div>
              </div>

              {/* Prize Distribution */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  Prize Distribution
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="prizeDistribution" className="text-gray-700">Prize Distribution</Label>
                    <Select value={formData.prizeDistribution} onValueChange={(value) => handleSelectChange('prizeDistribution', value)}>
                      <SelectTrigger id="prizeDistribution" className="rounded-xl">
                        <SelectValue placeholder="Select prize distribution" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="winner_takes_all">Winner Takes All (100%)</SelectItem>
                        <SelectItem value="top_3_split">Top 3 Split (50-30-20)</SelectItem>
                        <SelectItem value="top_5_split">Top 5 Split (40-25-15-10-10)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl">
                    <h4 className="font-medium text-blue-900 mb-2">Estimated Prize Pool</h4>
                    <div className="flex items-baseline gap-1">
                      <IndianRupee className="h-5 w-5 text-blue-600" />
                      <span className="text-2xl font-bold text-blue-700">{estimatedPrizePool.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      Based on {formData.maxParticipants || 'unlimited'} participants
                    </p>
                  </div>
                </div>

                {/* Prize Distribution Preview */}
                {formData.entryFee > 0 && formData.prizeDistribution && (
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Prize Distribution Preview</h4>
                    <div className="space-y-2">
                      {formData.prizeDistribution === 'winner_takes_all' && (
                        <div className="flex justify-between items-center p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                          <span className="font-medium">1st Place</span>
                          <span className="font-bold">100% (₹{estimatedPrizePool.toLocaleString()})</span>
                        </div>
                      )}
                      {formData.prizeDistribution === 'top_3_split' && (
                        <>
                          <div className="flex justify-between items-center p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                            <span className="font-medium">1st Place</span>
                            <span className="font-bold">50% (₹{(estimatedPrizePool * 0.5).toLocaleString()})</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                            <span className="font-medium">2nd Place</span>
                            <span className="font-bold">30% (₹{(estimatedPrizePool * 0.3).toLocaleString()})</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                            <span className="font-medium">3rd Place</span>
                            <span className="font-bold">20% (₹{(estimatedPrizePool * 0.2).toLocaleString()})</span>
                          </div>
                        </>
                      )}
                      {formData.prizeDistribution === 'top_5_split' && (
                        <>
                          <div className="flex justify-between items-center p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                            <span className="font-medium">1st Place</span>
                            <span className="font-bold">40% (₹{(estimatedPrizePool * 0.4).toLocaleString()})</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                            <span className="font-medium">2nd Place</span>
                            <span className="font-bold">25% (₹{(estimatedPrizePool * 0.25).toLocaleString()})</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                            <span className="font-medium">3rd Place</span>
                            <span className="font-bold">15% (₹{(estimatedPrizePool * 0.15).toLocaleString()})</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                            <span className="font-medium">4th Place</span>
                            <span className="font-bold">10% (₹{(estimatedPrizePool * 0.1).toLocaleString()})</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                            <span className="font-medium">5th Place</span>
                            <span className="font-bold">10% (₹{(estimatedPrizePool * 0.1).toLocaleString()})</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Visibility Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-gray-700">Public Challenge</Label>
                    <p className="text-sm text-gray-500">Make this challenge visible to all users</p>
                  </div>
                  <Switch
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Challenge...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Create Challenge
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
