import { useState } from "react";
import * as XLSX from "xlsx";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, BarChart, PieChart, LineChart } from "lucide-react";

type DataRow = Record<string, any>;

export function DataDashboard() {
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "visualization">("table");
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<DataRow>(worksheet);
        
        if (jsonData.length === 0) {
          throw new Error("No data found in the Excel file");
        }

        setData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to process file");
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError("Error reading file");
      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const triggerFileInput = () => {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    fileInput?.click();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Your Data</CardTitle>
        </CardHeader>
        <CardContent>
          <Input 
            id="file-upload"
            type="file" 
            accept=".csv,.xlsx,.xls" 
            onChange={handleFileUpload}
            disabled={loading}
          />
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <p className="text-sm text-muted-foreground mt-2">
            Supported formats: .xlsx, .xls, .csv
          </p>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
            <p>Processing your data...</p>
          </CardContent>
        </Card>
      )}

      {data.length > 0 && !loading && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              onClick={() => setViewMode('table')}
            >
              <Table className="mr-2 h-4 w-4" /> Table View
            </Button>
            <Button
              variant={viewMode === 'visualization' ? 'default' : 'outline'}
              onClick={() => setViewMode('visualization')}
            >
              <BarChart className="mr-2 h-4 w-4" /> Visualization
            </Button>

            {viewMode === 'visualization' && (
              <div className="flex gap-2 ml-auto">
                <Button
                  variant={chartType === 'bar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('bar')}
                >
                  Bar
                </Button>
                <Button
                  variant={chartType === 'line' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('line')}
                >
                  Line
                </Button>
                <Button
                  variant={chartType === 'pie' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('pie')}
                >
                  Pie
                </Button>
              </div>
            )}
          </div>

          {/* Data Preview */}
          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(data[0]).map((key) => (
                        <th 
                          key={key}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.slice(0, 5).map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((value, j) => (
                          <td 
                            key={j} 
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.length > 5 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Showing first 5 rows of {data.length} total rows
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}