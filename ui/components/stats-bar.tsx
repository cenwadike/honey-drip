"use client"

import { BarChart3, Users, TrendingUp, Shield } from "lucide-react"

export default function StatsBar() {
  return (
    // The main section is now darker and has more padding to make the stats stand out.
    // A border-t separates it from the section above for a cleaner look.
    <section className="w-full py-16 bg-gray-950 border-t border-gray-800">
      <div className="container px-4 md:px-6">
        {/* The grid is spaced out more and the columns are better defined */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          
          {/* Each statistic is now a self-contained, interactive card */}
          {/* This gives a much more modern and professional look  with Bybit interface as inspiration*/}
          <div className="flex flex-col items-center justify-center space-y-4 p-6 text-center bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10 transition-transform duration-300 hover:scale-105">
            {/* The icons are now larger and more prominent */}
            <BarChart3 className="h-8 w-8 text-amber-500" />
            {/* The numbers are bigger, bolder, and use the theme color */}
            <h3 className="text-3xl font-extrabold text-white">$10.76M+</h3>
            {/* The description is a bit larger and clearer */}
            <p className="text-sm font-medium text-gray-400">Total Value Locked</p>
          </div>
          
          <div className="flex flex-col items-center justify-center space-y-4 p-6 text-center bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10 transition-transform duration-300 hover:scale-105">
            <Users className="h-8 w-8 text-amber-500" />
            <h3 className="text-3xl font-extrabold text-white">23.6K+</h3>
            <p className="text-sm font-medium text-gray-400">Active Stakers</p>
          </div>
          
          <div className="flex flex-col items-center justify-center space-y-4 p-6 text-center bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10 transition-transform duration-300 hover:scale-105">
            <TrendingUp className="h-8 w-8 text-amber-500" />
            <h3 className="text-3xl font-extrabold text-white">100%+</h3>
            <p className="text-sm font-medium text-gray-400">Max APY</p>
          </div>
          
          <div className="flex flex-col items-center justify-center space-y-4 p-6 text-center bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10 transition-transform duration-300 hover:scale-105">
            <Shield className="h-8 w-8 text-amber-500" />
            <h3 className="text-3xl font-extrabold text-white">99.89%</h3>
            <p className="text-sm font-medium text-gray-400">Uptime</p>
          </div>
          
        </div>
      </div>
    </section>
  )
}
