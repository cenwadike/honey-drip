import { BarChart3, Users, TrendingUp, Shield } from "lucide-react"

export default function StatsBar() {
  return (
    <section className="w-full py-6 border-y">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="flex flex-col items-center justify-center space-y-2 p-4 text-center">
            <BarChart3 className="h-6 w-6 text-amber-500" />
            <h3 className="text-xl font-bold">$10M+</h3>
            <p className="text-xs text-muted-foreground">Total Value Locked</p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-2 p-4 text-center">
            <Users className="h-6 w-6 text-amber-500" />
            <h3 className="text-xl font-bold">15K+</h3>
            <p className="text-xs text-muted-foreground">Active Users</p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-2 p-4 text-center">
            <TrendingUp className="h-6 w-6 text-amber-500" />
            <h3 className="text-xl font-bold">100%+</h3>
            <p className="text-xs text-muted-foreground">Max APY</p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-2 p-4 text-center">
            <Shield className="h-6 w-6 text-amber-500" />
            <h3 className="text-xl font-bold">99.9%</h3>
            <p className="text-xs text-muted-foreground">Uptime</p>
          </div>
        </div>
      </div>
    </section>
  )
}
