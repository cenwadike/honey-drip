"use client"

import { BarChart3, Users, TrendingUp, Shield } from "lucide-react"

export default function StatsBar() {
  return (
    // Replaced hardcoded gray background and border with `bg-background` and `border-border`
    <section className="w-full py-16 bg-background border-t border-border">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          
          <div className="flex flex-col items-center justify-center space-y-4 p-6 text-center bg-card/5 backdrop-blur-sm rounded-2xl shadow-lg border border-border transition-transform duration-300 hover:scale-105">
            {/* Replaced hardcoded colors with `text-primary` and `text-foreground` */}
            <BarChart3 className="h-8 w-8 text-primary" />
            <h3 className="text-3xl font-extrabold text-foreground">$10.76M+</h3>
            {/* Replaced hardcoded gray with `text-muted-foreground` */}
            <p className="text-sm font-medium text-muted-foreground">Total Value Locked</p>
          </div>
          
          <div className="flex flex-col items-center justify-center space-y-4 p-6 text-center bg-card/5 backdrop-blur-sm rounded-2xl shadow-lg border border-border transition-transform duration-300 hover:scale-105">
            <Users className="h-8 w-8 text-primary" />
            <h3 className="text-3xl font-extrabold text-foreground">23.6K+</h3>
            <p className="text-sm font-medium text-muted-foreground">Active Stakers</p>
          </div>
          
          <div className="flex flex-col items-center justify-center space-y-4 p-6 text-center bg-card/5 backdrop-blur-sm rounded-2xl shadow-lg border border-border transition-transform duration-300 hover:scale-105">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h3 className="text-3xl font-extrabold text-foreground">100%+</h3>
            <p className="text-sm font-medium text-muted-foreground">Max APY</p>
          </div>
          
          <div className="flex flex-col items-center justify-center space-y-4 p-6 text-center bg-card/5 backdrop-blur-sm rounded-2xl shadow-lg border border-border transition-transform duration-300 hover:scale-105">
            <Shield className="h-8 w-8 text-primary" />
            <h3 className="text-3xl font-extrabold text-foreground">99.89%</h3>
            <p className="text-sm font-medium text-muted-foreground">Uptime</p>
          </div>
          
        </div>
      </div>
    </section>
  )
}