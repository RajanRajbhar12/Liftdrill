"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { CalendarIcon, Download } from "lucide-react"
import { motion } from "framer-motion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Transaction {
  id: string
  date: string // ISO 8601 string
  description: string
  amount: number
  currency: string
  status: "completed" | "pending" | "failed"
  type: "charge" | "refund" | "payment"
}

// Simulate fetching transaction history
const simulatedTransactionHistory: Transaction[] = [
  { id: "txn_1", date: "2023-10-26T10:00:00Z", description: "Challenge Entry: Marathon", amount: 250, currency: "INR", status: "completed", type: "charge" },
  { id: "txn_2", date: "2023-10-25T14:30:00Z", description: "Prize Payout: 10K Race", amount: 1500, currency: "INR", status: "completed", type: "payment" },
  { id: "txn_3", date: "2023-10-24T09:15:00Z", description: "Subscription Fee", amount: 500, currency: "INR", status: "completed", type: "charge" },
  { id: "txn_4", date: "2023-10-23T11:00:00Z", description: "Refund: Challenge Entry", amount: -250, currency: "INR", status: "completed", type: "refund" },
  { id: "txn_5", date: "2023-10-22T16:00:00Z", description: "Challenge Entry: Cycling", amount: 250, currency: "INR", status: "completed", type: "charge" },
]

export default function BillingHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(simulatedTransactionHistory)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<{ from: Date | undefined, to: Date | undefined }>({ from: undefined, to: undefined })
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")

  // Simulate filtering (client-side for demo)
  const filteredTransactions = transactions.filter(txn => {
    const txnDate = parseISO(txn.date)
    const isInDateRange = (!dateRange.from || txnDate >= dateRange.from) && (!dateRange.to || txnDate <= dateRange.to)
    const matchesStatus = filterStatus === "all" || txn.status === filterStatus
    const matchesType = filterType === "all" || txn.type === filterType
    return isInDateRange && matchesStatus && matchesType
  })

  const handleExport = () => {
    // Simulate data export (e.g., CSV)
    toast({
      title: "Export Initiated",
      description: "Your billing history is being prepared for download.",
    })
    // In a real app, generate and provide the file
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Billing History</h1>
          <p className="text-gray-600">View your past transactions and billing details.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="shadow-xl border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Transactions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filters and Export */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Date Range Picker */}
                <div className="grid gap-2">
                  <Label htmlFor="dateRange">Date Range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="dateRange"
                        variant={"outline"}
                        className={cn(
                          "w-[240px] justify-start text-left font-normal rounded-xl",
                          !dateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                        numberOfMonths={2}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Status Filter */}
                <div className="grid gap-2">
                  <Label htmlFor="statusFilter">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger id="statusFilter" className="w-[180px] rounded-xl">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Type Filter */}
                <div className="grid gap-2">
                  <Label htmlFor="typeFilter">Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger id="typeFilter" className="w-[180px] rounded-xl">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="charge">Charge</SelectItem>
                      <SelectItem value="refund">Refund</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Export Button */}
                <div className="grid gap-2 sm:mt-auto">
                  <Label htmlFor="exportButton" className="invisible">Export</Label>
                  <Button id="exportButton" onClick={handleExport} variant="outline" className="flex items-center gap-2 rounded-xl">
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </div>

              {/* Transaction Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500">No transactions found.</TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map((txn) => (
                        <TableRow key={txn.id}>
                          <TableCell>{format(parseISO(txn.date), "PPP p")}</TableCell>
                          <TableCell>{txn.description}</TableCell>
                          <TableCell>{`${txn.amount.toFixed(2)} ${txn.currency}`}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium
                              ${txn.status === "completed" ? "bg-green-100 text-green-800"
                              : txn.status === "pending" ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"}
                            `}>
                              {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium
                              ${txn.type === "charge" ? "bg-blue-100 text-blue-800"
                              : txn.type === "refund" ? "bg-red-100 text-red-800"
                              : "bg-purple-100 text-purple-800"}
                            `}>
                              {txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 