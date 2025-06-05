import { DataDashboard } from "@/components/DataDashboard";

// Sample data - replace with your actual data
const sampleData = [
  { id: 1, name: "Project A", progress: 75, status: "Active" },
  { id: 2, name: "Project B", progress: 30, status: "Pending" },
  { id: 3, name: "Project C", progress: 100, status: "Completed" }
];

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Data Analysis Dashboard</h1>
      <DataDashboard data={sampleData} />
    </main>
  );
}