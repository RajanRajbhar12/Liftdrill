"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createChallenge } from "@/lib/actions"
import { toast } from "sonner"
import { Loader2, PlusCircle, Trophy, Calendar, Users, AlertCircle } from "lucide-react"
import Link from "next/link"

interface ChallengeFormData {
  title: string
  description: string
  longDescription: string
  category: string
  entryFee: number
  prizePool: number
  endDate: string
  rules: string[]
  isPublic: boolean
  thumbnail?: File
}

export default function CreateChallengePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ChallengeFormData>({
    title: "",
    description: "",
    longDescription: "",
    category: "",
    entryFee: 0,
    prizePool: 0,
    endDate: "",
    rules: [],
    isPublic: true,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === "rules") {
      // Split the input by newlines and filter out empty lines
      const rulesArray = value.split("\n").filter(rule => rule.trim() !== "")
      setFormData((prev) => ({ ...prev, [name]: rulesArray }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const form = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "thumbnail") {
          if (value instanceof File) {
            form.append("thumbnail", value)
          }
        } else if (key === "rules") {
          // Rules are already an array, just stringify them
          form.append(key, JSON.stringify(value))
        } else {
          form.append(key, value)
        }
      })

      await createChallenge(form)
      toast.success("Challenge created successfully!")
      router.push("/challenges")
    } catch (error) {
      console.error("Error creating challenge:", error)
      toast.error("Failed to create challenge")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Create a Challenge</h1>
            <p className="text-lg md:text-xl text-green-100">
              Design an exciting fitness challenge and let others join the competition
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Challenge Details</CardTitle>
              <CardDescription>Fill in the details to create your fitness challenge</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Challenge Title</Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter challenge title"
                        required
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="strength">Strength</SelectItem>
                          <SelectItem value="cardio">Cardio</SelectItem>
                          <SelectItem value="flexibility">Flexibility</SelectItem>
                          <SelectItem value="endurance">Endurance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Short Description</Label>
                    <Input
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief description of the challenge"
                      required
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longDescription">Detailed Description</Label>
                    <Textarea
                      id="longDescription"
                      name="longDescription"
                      value={formData.longDescription}
                      onChange={handleInputChange}
                      placeholder="Provide a detailed description of your challenge..."
                      className="min-h-[150px]"
                    />
                  </div>
                </div>

                {/* Challenge Settings */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Challenge Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="entryFee">Entry Fee (₹)</Label>
                      <Input
                        id="entryFee"
                        name="entryFee"
                        type="number"
                        value={formData.entryFee}
                        onChange={handleInputChange}
                        placeholder="Enter entry fee amount"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                </div>

                {/* Rules */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Challenge Rules</h3>
                  <div className="space-y-2">
                    <Label htmlFor="rules">Rules (one per line)</Label>
                    <Textarea
                      id="rules"
                      name="rules"
                      value={Array.isArray(formData.rules) ? formData.rules.join("\n") : formData.rules}
                      onChange={handleInputChange}
                      placeholder="Enter challenge rules (one per line)"
                      required
                      className="bg-white min-h-[120px]"
                    />
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Tips for a Great Challenge</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Set clear and achievable goals</li>
                        <li>• Define specific rules and success criteria</li>
                        <li>• Choose an appropriate entry fee</li>
                        <li>• Set a reasonable end date</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/challenges")}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="mr-2 h-4 w-4" />
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
    </div>
  )
} 