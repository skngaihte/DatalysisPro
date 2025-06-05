import DataDashboard from "../components/DataDashboard"

interface DashboardProps {
  data: any
}

export default function Dashboard({ data }: DashboardProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Your Data Dashboard</h2>
      <DataDashboard data={data || []} />
    </div>
  )
}
