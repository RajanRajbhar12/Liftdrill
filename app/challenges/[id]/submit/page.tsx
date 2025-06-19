"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { submitVideo } from "@/lib/actions"

interface Props {
  params: { id: string }
}

export default function SubmitPage({ params }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [notes, setNotes] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Video file size must be less than 10MB")
        return
      }
      // Check file type
      if (!file.type.startsWith("video/")) {
        toast.error("Please upload a valid video file")
        return
      }
      setVideoFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoFile) {
      toast.error("Please select a video file")
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("challengeId", params.id)
      formData.append("video", videoFile)
      formData.append("notes", notes)
      formData.append("score", "0") // Default score, can be updated later

      const result = await submitVideo(formData)
      if (result.success) {
        toast.success("Video submitted successfully!")
        router.push(`/challenges/${params.id}`)
      } else {
        throw new Error("Failed to submit video")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit video")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Submit Your Video</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="video">Video File</Label>
            <Input
              id="video"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              disabled={isLoading}
              required
            />
            <p className="text-sm text-muted-foreground">
              Maximum file size: 10MB. Supported formats: MP4, MOV, AVI
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about your submission..."
              disabled={isLoading}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Submitting..." : "Submit Video"}
          </Button>
        </form>
      </Card>
    </div>
  )
} 