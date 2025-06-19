"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { validateSubmission } from "@/lib/actions"
import { toast } from "sonner"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface Submission {
  id: string
  video_url: string
  user: {
    username: string
    full_name: string
  }
  challenge: {
    title: string
  }
  status: string
  score?: number
  form_score?: number
  rep_count?: number
  validation_notes?: string
}

interface SubmissionValidatorProps {
  submission: Submission
  onValidationComplete: () => void
}

export function SubmissionValidator({ submission, onValidationComplete }: SubmissionValidatorProps) {
  const [loading, setLoading] = useState(false)
  const [formScore, setFormScore] = useState(0)
  const [repCount, setRepCount] = useState(0)
  const [notes, setNotes] = useState("")

  const handleValidate = async (isApproved: boolean) => {
    try {
      setLoading(true)
      const result = await validateSubmission(submission.id, {
        score: 0, // Will be calculated in the backend
        formScore,
        repCount,
        notes,
        isApproved
      })

      if (result.success) {
        toast.success(isApproved ? "Submission approved" : "Submission rejected")
        onValidationComplete()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to validate submission")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Submission Details</h3>
          <p className="text-sm text-gray-500">
            User: {submission.user.full_name} (@{submission.user.username})
          </p>
          <p className="text-sm text-gray-500">
            Challenge: {submission.challenge.title}
          </p>
        </div>

        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <video
            src={submission.video_url}
            controls
            className="w-full h-full object-contain"
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Form Score (0-100)</label>
            <Slider
              value={[formScore]}
              onValueChange={([value]) => setFormScore(value)}
              min={0}
              max={100}
              step={1}
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-1">
              Score based on exercise form, technique, and execution
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Repetition Count</label>
            <div className="flex items-center gap-4 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRepCount(Math.max(0, repCount - 1))}
              >
                -
              </Button>
              <span className="text-lg font-semibold">{repCount}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRepCount(repCount + 1)}
              >
                +
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Validation Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about the submission..."
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            variant="destructive"
            onClick={() => handleValidate(false)}
            disabled={loading}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>
          <Button
            variant="default"
            onClick={() => handleValidate(true)}
            disabled={loading}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve
          </Button>
        </div>
      </div>
    </Card>
  )
} 