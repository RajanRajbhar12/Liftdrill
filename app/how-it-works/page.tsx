"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Users, Trophy, Calendar, Lightbulb } from "lucide-react";

const steps = [
  {
    icon: <Lightbulb className="h-10 w-10 text-blue-600" />,
    title: "Join Fitness Challenges",
    description: "Choose from a variety of fitness challenges with real money prize pools. Whether it's running, weightlifting, or yoga, find a challenge that suits you.",
  },
  {
    icon: <Users className="h-10 w-10 text-purple-600" />,
    title: "Compete & Win",
    description: "Compete against other participants and push your limits. Track your progress and see how you rank on the leaderboard for a chance to win real money.",
  },
  {
    icon: <Calendar className="h-10 w-10 text-teal-600" />,
    title: "Track Your Progress",
    description: "Track your fitness activities seamlessly. Our platform integrates with popular fitness apps and devices, providing real-time updates on your progress within the challenge.",
  },
  {
    icon: <Trophy className="h-10 w-10 text-yellow-600" />,
    title: "Earn Real Money",
    description: "Once a challenge is completed and verified, winners receive their share of the real money prize pool directly in their GymRush wallet.",
  },
  {
    icon: <Rocket className="h-10 w-10 text-pink-600" />,
    title: "Keep Winning",
    description: "With new challenges launching regularly, you can keep participating, improving your fitness, and earning real money rewards.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">How LiftDrill Works</h1>
          <p className="text-xl text-gray-600">Turn your fitness journey into real money rewards</p>
        </motion.div>

        {/* Steps Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-xl border-0 hover:shadow-2xl transition-all duration-300"
            >
              <Card className="shadow-xl border-0 rounded-2xl h-full flex flex-col bg-gradient-to-br from-white to-indigo-50">
                <CardHeader className="flex flex-row items-center space-x-4">
                  <div className="flex-shrink-0 p-3 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-full text-white">
                    {step.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-800">{`Step ${index + 1}: ${step.title}`}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-gray-600">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 