// app/(dashboard)/page.tsx
import DashboardCards from "../components/market/dashboard-cards"

export default function DashboardPage() {
  return (
    <div className="p-1">
      <h1 className="text-2xl font-bold mb-6">Market Overview</h1>
      <DashboardCards />
    </div>
  )
}