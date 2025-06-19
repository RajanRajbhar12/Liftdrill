"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownLeft, Trophy, Target } from "lucide-react"
import { getUserTransactions } from "@/lib/actions"

interface Transaction {
  id: string
  type: "entry_fee" | "prize" | "refund"
  amount: number
  status: "completed" | "pending" | "failed"
  created_at: string
  challenge?: {
    title: string
    id: string
  }
  submission?: {
    id: string
    score: number
  }
}

interface TransactionHistoryProps {
  userId: string
}

export function TransactionHistory({ userId }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTransactions()
  }, [userId])

  const loadTransactions = async () => {
    try {
      const response = await getUserTransactions(userId)
      if (response.success && response.data) {
        setTransactions(response.data)
      }
    } catch (error) {
      console.error("Error loading transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "entry_fee":
        return <ArrowDownLeft className="h-5 w-5 text-red-500" />
      case "prize":
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case "refund":
        return <ArrowUpRight className="h-5 w-5 text-green-500" />
      default:
        return <Target className="h-5 w-5 text-gray-500" />
    }
  }

  const getTransactionTitle = (transaction: Transaction) => {
    switch (transaction.type) {
      case "entry_fee":
        return `Entry Fee - ${transaction.challenge?.title}`
      case "prize":
        return `Prize Won - ${transaction.challenge?.title}`
      case "refund":
        return `Refund - ${transaction.challenge?.title}`
      default:
        return "Transaction"
    }
  }

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
      <div className="space-y-4">
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No transactions yet</p>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getTransactionIcon(transaction.type)}
                <div>
                  <p className="font-medium">{getTransactionTitle(transaction)}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`font-semibold ${
                    transaction.type === "entry_fee"
                      ? "text-red-500"
                      : transaction.type === "prize"
                      ? "text-green-500"
                      : "text-gray-500"
                  }`}
                >
                  {transaction.type === "entry_fee" ? "-" : "+"}
                  {formatAmount(transaction.amount)}
                </p>
                <p className="text-sm text-gray-500 capitalize">
                  {transaction.status}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
} 