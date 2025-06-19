'use client'

import { useState, useEffect } from 'react';
import { getAllTransactions } from '@/lib/actions';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Transaction {
  id: string;
  user_id: string;
  challenge_id: string | null;
  type: "entry_fee" | "prize" | "refund" | "deposit";
  amount: number;
  status: "pending" | "completed" | "failed";
  created_at: string;
  user?: { id: string; username: string; full_name: string | null; email: string | null } | null; // Include user details
  challenge?: { id: string; title: string } | null; // Include challenge details
}

// Placeholder formatCurrency if not in utils - replace if needed
const formatCurrencyLocal = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) {
    return '₹0';
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      const result = await getAllTransactions();
      if (result.success && result.data) {
        setTransactions(result.data);
      } else {
        toast.error(result.error || "Failed to fetch transactions.");
        setTransactions([]); // Ensure transactions is an empty array on error
      }
      setLoading(false);
    }

    fetchTransactions();
  }, []);

  if (loading) {
    return <div>Loading transactions...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">All Transactions (Admin)</h1>

      <Card>
        <CardHeader>
          <CardTitle>Transaction List</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p>No transactions found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Challenge</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono text-xs">{tx.id}</TableCell>
                    <TableCell>{tx.user?.username || tx.user?.full_name || tx.user_id || 'N/A'}</TableCell>
                    <TableCell>{tx.type}</TableCell>
                    <TableCell className={tx.type === 'prize' || tx.type === 'refund' || tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}>
                      {tx.type === 'entry_fee' ? '-' : '+'}{formatCurrencyLocal(tx.amount)}
                    </TableCell>
                    <TableCell>{tx.challenge?.title || 'N/A'}</TableCell>
                    <TableCell>{tx.status}</TableCell>
                    <TableCell>{new Date(tx.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 