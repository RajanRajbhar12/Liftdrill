"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSubmissions } from "@/lib/actions"
import { toast } from "sonner"
import { SubmissionValidator } from "./components/SubmissionValidator"
import { Search, Filter, Video } from "lucide-react"

interface Submission {
  id: string
  video_url: string
  status: string
  score?: number
  form_score?: number
  rep_count?: number
  validation_notes?: string
  created_at: string
  user: {
    id: string
    username: string
    full_name: string
  }
  challenge: {
    id: string
    title: string
  }
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    loadSubmissions()
  }, [])

  const loadSubmissions = async () => {
    try {
      const data = await getSubmissions()
      setSubmissions(data)
    } catch (error) {
      console.error("Error loading submissions:", error)
      toast.error("Failed to load submissions")
    } finally {
      setLoading(false)
    }
  }

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.challenge.title.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || submission.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleValidationComplete = () => {
    setSelectedSubmission(null)
    loadSubmissions()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Submission Management</h1>
        <div className="text-sm text-gray-500">
          Total Submissions: {submissions.length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Submissions List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <Card
                key={submission.id}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedSubmission?.id === submission.id
                    ? "border-primary"
                    : "hover:border-gray-400"
                }`}
                onClick={() => setSelectedSubmission(submission)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <Video className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {submission.user.full_name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {submission.challenge.title}
                    </p>
                  </div>
                  <div className="text-sm">
                    <span
                      className={`px-2 py-1 rounded-full ${
                        submission.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : submission.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {submission.status}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Submission Validator */}
        <div className="lg:col-span-2">
          {selectedSubmission ? (
            <SubmissionValidator
              submission={selectedSubmission}
              onValidationComplete={handleValidationComplete}
            />
          ) : (
            <Card className="p-6 flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <Video className="h-12 w-12 mx-auto mb-4" />
                <p>Select a submission to validate</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 