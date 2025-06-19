"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, Trophy, Video, Users, Play, Star, Clock, ArrowRight, ChevronRight, Sparkles } from "lucide-react"
// Removed getChallenges import
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface Challenge {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  type: string
  status: string
  participants: number
  prize: number
  daysLeft: number
  entryFee: number
}

interface LandingPageContentProps {
  challenges: Challenge[];
}

export default function LandingPageContent({ challenges }: LandingPageContentProps) {
  // Removed data fetching state and effect
  // Retained filter/sort state and logic if needed on client, or move to server if possible.
  // For now, assuming challenges prop is already processed.

  const processedChallenges = challenges

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200">
      {/* Hero Section with Parallax Effect */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800/20 to-indigo-800/20 z-0" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0)))" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Temporarily remove motion from Hero Section */}
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            > */}
              <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent">
                Elevate Your Fitness Journey
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 mb-10 leading-relaxed">
                Join a community pushing boundaries. Compete, achieve, and earn unparalleled rewards.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild size="lg" className="bg-blue-800 hover:bg-blue-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <Link href="/challenges" className="flex items-center">
                    Explore Challenges <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-blue-800 border-blue-800 hover:bg-blue-50 hover:text-blue-900 text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <Link href="/auth/signup" className="flex items-center">
                    Become a Member <Sparkles className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            {/* </motion.div> */}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-blue-800 mb-2">10K+</div>
              <div className="text-gray-600">Active Members</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-indigo-800 mb-2">₹5M+</div>
              <div className="text-gray-600">Prize Pool</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-purple-800 mb-2">500+</div>
              <div className="text-gray-600">Challenges Hosted</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-teal-800 mb-2">98%</div>
              <div className="text-gray-600">Community Satisfaction</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-slate-100 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Join FitChallenge?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Discover a platform built for serious progress and rewarding competition.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-blue-800 to-indigo-800 text-white">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Users className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl">Dedicated Community</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-600">Connect with like-minded individuals passionate about fitness and personal growth.</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-purple-800 to-fuchsia-800 text-white">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Video className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl">Advanced Tracking</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-600">Utilize smart tools and verification methods for accurate progress monitoring.</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-teal-800 to-cyan-800 text-white">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl">Rewarding Competitions</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-600">Participate in diverse challenges with significant cash prizes and recognition.</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Your Path to Success: 3 Simple Steps</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Embark on your transformation journey today with ease.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{
                number: "01",
                title: "Create Your Profile",
                description: "Personalize your fitness journey and set your initial goals.",
                icon: <Users className="h-8 w-8" />,
              },
              {
                number: "02",
                title: "Discover Challenges",
                description: "Browse through a variety of challenges tailored to different fitness levels.",
                icon: <Trophy className="h-8 w-8" />,
              },
              {
                number: "03",
                title: "Compete & Thrive",
                description: "Track your progress, engage with the community, and climb the ranks.",
                icon: <Video className="h-8 w-8" />,
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        {step.icon}
                      </div>
                      <div>
                        <div className="text-sm text-blue-800 font-medium">{step.number}</div>
                        <CardTitle className="text-xl text-gray-800">{step.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-800 to-indigo-800 text-white">
        <div className="container mx-auto px-4 text-center">
          {/* Temporarily remove motion from CTA Section */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          > */}
            <h2 className="text-4xl font-bold mb-6">Begin Your Elevated Fitness Journey Today</h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto">Sign up now and become part of a thriving community dedicated to achieving peak performance.</p>
            <Button asChild size="lg" className="bg-white text-blue-800 hover:bg-gray-100 text-lg px-10 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Link href="/auth/signup" className="flex items-center">
                Join FitChallenge Now <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          {/* </motion.div> */}
        </div>
      </section>
    </div>
  )
} 