import { DataDashboard } from "./components/DataDashboard";

function App() {
  const mockData = [
    { id: 1, product: "Laptop", sales: 120, region: "North" },
    { id: 2, product: "Phone", sales: 250, region: "South" }
  ];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Business Analytics</h1>
      <DataDashboard data={mockData} />
    </div>
  );
}

export default App;