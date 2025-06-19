"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Wallet as WalletIcon, History, PlusCircle, MinusCircle, Loader2, ArrowRight, ArrowLeft, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";

// Define interfaces - Ensure these match your API response and DB schema
interface Transaction {
  id: string;
  user_id: string;
  challenge_id: string | null; 
  type: "entry_fee" | "prize" | "refund" | "deposit" | "withdrawal"; 
  amount: number;
  status: "pending" | "completed" | "failed" | "cancelled" | "processing"; 
  created_at: string;
  challenge?: { // Optional challenge details if related to a challenge
    title: string;
  };
}

// Placeholder formatCurrency - Consider moving to a shared utils file
const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) {
    return '₹0';
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

export default function WalletPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [depositLoading, setDepositLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (authLoading) return;

      if (!authUser?.id) {
        console.log("No authenticated user found, redirecting to login.");
        router.replace('/auth/login?redirect=/wallet');
        return;
      }

      try {
        await loadWalletData(authUser.id);
      } catch (error) {
        console.error('Error loading wallet data:', error);
        toast.error("Failed to load wallet data. Please try again.");
      }
    };

    loadData();
  }, [authUser, authLoading, router]);

  const loadWalletData = async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch("/api/wallet/data");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch wallet data");
      }

      if (result.success) {
        setBalance(result.data.balance);
        setTransactions(result.data.transactions);
      } else {
        throw new Error(result.error || "Failed to fetch wallet data");
      }
    } catch (error: any) {
      console.error("Error loading wallet data:", error);
      toast.error(error.message || "Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    const userId = authUser?.id;
    if (!userId) {
      toast.error("Authentication required");
      router.replace('/auth/login?redirect=/wallet');
      return;
    }

    if (depositAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setProcessingPayment(true);
    try {
      // Simulating a successful manual deposit for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Manual deposit simulated successfully!");
      await loadWalletData(userId);
    } catch (error: any) {
      toast.error(error.message || "An error occurred during deposit");
    } finally {
      setProcessingPayment(false);
      setDepositAmount(0);
    }
  };

  const handleWithdraw = async () => {
    const userId = authUser?.id;
    if (!userId) {
      toast.error("Authentication required");
      router.replace('/auth/login?redirect=/wallet');
      return;
    }

    if (withdrawAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (balance !== null && withdrawAmount > balance) {
      toast.error("Insufficient balance");
      return;
    }

    setProcessingPayment(true);
    try {
      // Simulating a successful manual withdrawal for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Manual withdrawal simulated successfully!");
      await loadWalletData(userId);
    } catch (error: any) {
      toast.error(error.message || "An error occurred during withdrawal");
    } finally {
      setProcessingPayment(false);
      setWithdrawAmount(0);
    }
  };

  if (!authUser || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading wallet information...</p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return <div className="text-center text-red-600">Please log in to view your wallet.</div>;
  }

  // Ensure balance is not null before rendering
  const currentBalance = balance ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white py-6 md:py-12">
      <div className="container mx-auto px-4">
        {/* Wallet Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              My Wallet
            </h1>
            <p className="text-gray-600 mt-1">Manage your balance and transactions</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push('/profile')}
              variant="outline"
              className="w-full md:w-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </div>
        </div>

        {/* Balance Card */}
        <Card className="border-0 shadow-lg rounded-xl mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="text-sm font-medium text-gray-500">Available Balance</p>
                <h2 className="text-4xl font-bold mt-1">₹{currentBalance.toLocaleString()}</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => setShowDepositModal(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Deposit
                </Button>
                <Button
                  onClick={() => setShowWithdrawModal(true)}
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={currentBalance <= 0}
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Withdraw
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
            <Button
              variant="ghost"
              onClick={() => router.push('/profile?tab=transactions')}
              className="text-blue-600 hover:text-blue-700"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {transactions.length === 0 ? (
            <Card className="border-0 shadow-lg rounded-xl">
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500">No transactions yet.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-lg rounded-xl">
              <CardContent className="pt-6">
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th scope="col" className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-gray-50">
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(tx.created_at).toLocaleDateString()} {new Date(tx.created_at).toLocaleTimeString()}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium capitalize text-gray-800">
                              {tx.type.replace('_', ' ')}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {tx.challenge_id ? `Challenge #${tx.challenge_id}` : 'Wallet Transaction'}
                            </td>
                            <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${tx.type === 'prize' ? 'text-blue-600' : 'text-red-600'}`}>
                              {tx.type === 'prize' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                              {tx.status}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deposit Funds</DialogTitle>
            <DialogDescription>
              Enter the amount you want to deposit into your wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                min="100"
                step="100"
                value={depositAmount || ''}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                placeholder="Enter amount"
                className="w-full"
              />
              <p className="text-sm text-gray-500">Minimum deposit: ₹100</p>
            </div>
            {depositError && (
              <p className="text-sm text-red-600">{depositError}</p>
            )}
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDepositModal(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeposit}
              disabled={!depositAmount || depositAmount < 100 || depositLoading}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition-colors"
            >
              {depositLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Deposit'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Modal */}
      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              Enter the amount you want to withdraw from your wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="withdrawAmount">Amount (₹)</Label>
              <Input
                id="withdrawAmount"
                type="number"
                min="100"
                step="100"
                max={currentBalance}
                value={withdrawAmount || ''}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                placeholder="Enter amount"
                className="w-full"
              />
              <p className="text-sm text-gray-500">
                Available balance: ₹{currentBalance.toLocaleString()}
              </p>
            </div>
            {withdrawError && (
              <p className="text-sm text-red-600">{withdrawError}</p>
            )}
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowWithdrawModal(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={!withdrawAmount || withdrawAmount < 100 || withdrawAmount > currentBalance || withdrawLoading}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition-colors"
            >
              {withdrawLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Withdraw'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}