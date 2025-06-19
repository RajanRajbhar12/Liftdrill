"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Medal, Wallet, Clock, CheckCircle, XCircle, AlertCircle, UserCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { getCurrentUser } from "@/lib/auth";

interface DatabaseChallenge {
  id: string;
  title: string;
  category: string;
  entry_fee: number;
  prize_pool: number;
  status: string;
  end_date: string;
  submission?: {
    score: number;
    status: string;
    video_url: string;
    submitted_at: string;
  };
}

interface Participation {
  challenge_id: string;
  challenge: DatabaseChallenge;
}

interface Transaction {
  id: string;
  amount: number;
  type: "entry_fee" | "prize";
  status: string;
  challenge_id: string | null;
  challenge_title: string;
  created_at: string;
}

interface UserStats {
  totalChallenges: number;
  completedChallenges: number;
  totalEarnings: number;
  totalSpent: number;
  winRate: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeChallenges, setActiveChallenges] = useState<DatabaseChallenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<DatabaseChallenge[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      setAuthChecked(false);
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        console.log("No current user found, redirecting to login.");
        router.replace('/auth/login');
        return;
      }

      setUser(currentUser);
      setAuthChecked(true);
      await loadUserData(currentUser.id);

    } catch (error) {
      console.error('Error checking auth:', error);
      toast.error("Authentication failed. Please log in.");
      router.replace('/auth/login');
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      setLoading(true);
      const supabase = createClient();

      // 1. Fetch challenge participations and challenge details
      const { data: participationData, error: participationError } = await supabase
        .from('challenge_participants')
        .select(`
          challenge_id,
          challenge:challenges (
            id,
            title,
            category,
            entry_fee,
            prize_pool,
            status,
            end_date
          )
        `)
        .eq('user_id', userId);

      if (participationError) throw participationError;

      const challenges = (participationData as unknown as Participation[] || [])
        .map(p => p.challenge)
        .filter((c): c is DatabaseChallenge => c !== null);

      // 2. Fetch user's submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select(`
          challenge_id,
          score,
          status,
          video_url,
          submitted_at
        `)
        .eq('user_id', userId);

      if (submissionsError) throw submissionsError;

      const submissionsMap = new Map(submissionsData?.map(sub => [sub.challenge_id, sub]));

      // Combine challenges with submissions and process
      const challengesWithSubmissions = challenges.map(challenge => ({
        ...challenge,
        submission: submissionsMap.get(challenge.id)
      }));

      // Filter active and completed challenges
      const now = new Date();
      const activeChallenges = challengesWithSubmissions.filter(c => {
        const endDate = new Date(c.end_date);
        return c.status === 'active' && endDate > now;
      });
      const completedChallenges = challengesWithSubmissions.filter(c => {
        const endDate = new Date(c.end_date);
        return c.status === 'completed' || endDate <= now;
      });

      setActiveChallenges(activeChallenges);
      setCompletedChallenges(completedChallenges);

      // 3. Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          id,
          amount,
          type,
          status,
          challenge_id,
          challenge:challenges(title),
          created_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (transactionsError) throw transactionsError;

      const processedTransactions = (transactionsData || []).map(t => ({
        id: t.id,
        amount: t.amount,
        type: t.type as "entry_fee" | "prize",
        status: t.status,
        challenge_id: t.challenge_id,
        challenge_title: ((t.challenge as unknown as { title: string })?.title) || 'N/A',
        created_at: t.created_at
      })) as Transaction[];

      setTransactions(processedTransactions);

      // 4. Calculate stats
      const totalEarnings = processedTransactions
        .filter(t => t.type === 'prize' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalSpent = processedTransactions
        .filter(t => t.type === 'entry_fee')
        .reduce((sum, t) => sum + t.amount, 0);

      const wins = completedChallenges.filter(c =>
        c.submission?.status === 'approved'
      ).length;

      setStats({
        totalChallenges: challenges.length,
        completedChallenges: completedChallenges.length,
        totalEarnings,
        totalSpent,
        winRate: completedChallenges.length > 0 ? (wins / completedChallenges.length) * 100 : 0
      });

    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center text-red-600">Error loading user information.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white py-6 md:py-12">
      <div className="container mx-auto px-4">
        {/* Profile Header - Mobile Friendly */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
          <UserCircle2 className="h-16 w-16 text-blue-600" />
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              {user.full_name || user.email}
            </h1>
            <p className="text-gray-600">@{user.username || user.id}</p>
          </div>
        </div>

        {/* Stats Overview - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-lg rounded-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Challenges</p>
                  <h3 className="text-2xl font-bold mt-1">{stats?.totalChallenges ?? 0}</h3>
                </div>
                <Trophy className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                  <h3 className="text-2xl font-bold mt-1">₹{(stats?.totalEarnings ?? 0).toLocaleString()}</h3>
                </div>
                <Wallet className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Win Rate</p>
                  <h3 className="text-2xl font-bold mt-1">{(stats?.winRate ?? 0).toFixed(1)}%</h3>
                </div>
                <Medal className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs - Mobile Friendly */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" className="text-sm md:text-base">Active</TabsTrigger>
            <TabsTrigger value="completed" className="text-sm md:text-base">Completed</TabsTrigger>
            <TabsTrigger value="transactions" className="text-sm md:text-base">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeChallenges.length === 0 ? (
              <Card className="border-0 shadow-lg rounded-xl">
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-500">No active challenges found.</p>
                  <Button
                    onClick={() => router.push('/challenges')}
                    className="mt-4 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition-colors"
                  >
                    Find Challenges
                  </Button>
                </CardContent>
              </Card>
            ) : (
              activeChallenges.map(challenge => (
                <Card key={challenge.id} className="border-0 shadow-lg rounded-xl">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-800">{challenge.title}</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                          <p>Category: {challenge.category}</p>
                          <p>Entry Fee: ₹{challenge.entry_fee}</p>
                          <p>Prize Pool: ₹{challenge.prize_pool}</p>
                          <p>Ends: {new Date(challenge.end_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => router.push(`/challenges/${challenge.id}`)}
                          variant="outline"
                          className="w-full md:w-auto"
                        >
                          View Challenge
                        </Button>
                        {!challenge.submission && (
                          <Button
                            onClick={() => router.push(`/upload?challengeId=${challenge.id}`)}
                            className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition-colors"
                          >
                            Submit Video
                          </Button>
                        )}
                      </div>
                    </div>
                    {challenge.submission ? (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-700 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-700">Submission Received</p>
                          <p className="text-xs text-gray-600">Awaiting review.</p>
                          <p className="text-xs text-gray-600 mt-1">Submitted on: {new Date(challenge.submission.submitted_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 p-4 bg-yellow-50 rounded-lg flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-700 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-yellow-700">No Submission Yet</p>
                          <p className="text-xs text-gray-600">Submit your video before the end date.</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedChallenges.length === 0 ? (
              <Card className="border-0 shadow-lg rounded-xl">
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-500">No completed challenges yet.</p>
                </CardContent>
              </Card>
            ) : (
              completedChallenges.map(challenge => (
                <Card key={challenge.id} className="border-0 shadow-lg rounded-xl">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-800">{challenge.title}</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                          <p>Category: {challenge.category}</p>
                          <p>Entry Fee: ₹{challenge.entry_fee}</p>
                          <p>Prize Pool: ₹{challenge.prize_pool}</p>
                          <p>Ended: {new Date(challenge.end_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {challenge.submission && (
                          <div className="text-sm text-gray-600 text-right">
                            <p>Score: {challenge.submission.score ?? 'N/A'}</p>
                            <p>Submitted: {new Date(challenge.submission.submitted_at).toLocaleDateString()}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          {challenge.submission?.status === 'approved' ? (
                            <span className="flex items-center gap-1 text-blue-600 font-medium">
                              <CheckCircle className="h-4 w-4" />
                              Approved (Won)
                            </span>
                          ) : challenge.submission?.status === 'rejected' ? (
                            <span className="flex items-center gap-1 text-red-600 font-medium">
                              <XCircle className="h-4 w-4" />
                              Rejected
                            </span>
                          ) : (challenge.status === 'completed' && !challenge.submission) ? (
                            <span className="flex items-center gap-1 text-gray-600 font-medium">
                              No Submission
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-yellow-600 font-medium">
                              <AlertCircle className="h-4 w-4" />
                              {challenge.submission?.status === 'pending' ? 'Pending Review' : 'Ended'}
                            </span>
                          )}
                        </div>
                        <Button
                          onClick={() => router.push(`/challenges/${challenge.id}`)}
                          variant="outline"
                          className="w-full md:w-auto"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            {transactions.length === 0 ? (
              <Card className="border-0 shadow-lg rounded-xl">
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-500">No transactions recorded yet.</p>
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
                                {tx.challenge_title || 'Wallet Transaction'}
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 