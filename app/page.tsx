"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { Trophy, DollarSign, Flame, ChevronRight, Sparkles, Users, Wallet, Scale, PlusCircle, IndianRupee } from "lucide-react"

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600 text-white py-12 relative overflow-hidden">
        {/* Background Gradient and Shapes (Enhanced)*/}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Trophy className="mx-auto h-20 w-20 text-yellow-400 mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight shadow-text">
              Transform Your Fitness, Earn Real Money
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
              Join exciting fitness challenges, compete with a vibrant community, and win real money prizes.
              Turn your dedication into tangible rewards with LiftDrill.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Button asChild className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-lg px-8 py-7 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
              <Link href="/challenges" className="flex items-center">
                <Flame className="mr-3 h-5 w-5"/> Browse Challenges
              </Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-lg px-8 py-7 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
              <Link href="/create-challenge" className="flex items-center">
                <PlusCircle className="mr-3 h-5 w-5"/> Create Challenge
              </Link>
            </Button>
            <Button asChild className="bg-white hover:bg-gray-50 text-indigo-800 text-lg px-8 py-7 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold border border-indigo-100">
              <Link href="/how-it-works" className="flex items-center">
                 <IndianRupee className="mr-3 h-5 w-5"/> How to Win Money
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* How to Participate Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
             className="text-3xl md:text-4xl font-bold text-gray-800 mb-10"
          >
             Ready to Earn?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col items-center space-y-4 p-6 rounded-lg border shadow-sm"
            >
              <Flame className="h-12 w-12 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-800">1. Join a Challenge</h3>
              <p className="text-gray-600">Browse challenges by type, entry fee, and prize pool. Find one that motivates you!</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center space-y-4 p-6 rounded-lg border shadow-sm"
            >
               <Scale className="h-12 w-12 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-800">2. Compete & Track</h3>
              <p className="text-gray-600">Achieve the challenge goals. Seamlessly track your progress through connected apps.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-center space-y-4 p-6 rounded-lg border shadow-sm"
            >
               <DollarSign className="h-12 w-12 text-yellow-600" />
              <h3 className="text-xl font-semibold text-gray-800">3. Win Money</h3>
              <p className="text-gray-600">Finish strong! Winners earn real money directly deposited into their GymRush wallet.</p>
            </motion.div>
          </div>
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.4 }}
             className="mt-10"
           >
             <Button asChild className="bg-blue-800 hover:bg-blue-700 text-white text-lg px-8 py-7 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
              <Link href="/challenges" className="flex items-center">
                Explore Challenges <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
           </motion.div>
        </div>
      </div>

      {/* Why Choose GymRush Section (Optional - can add later)*/}
       {/* <div className="py-16 bg-gray-50">
        </div>*/}

      {/* Footer */}
      <footer className="bg-gradient-to-r from-indigo-900 to-blue-800 text-white py-8">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} LiftDrill. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}
