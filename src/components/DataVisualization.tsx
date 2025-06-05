import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, BarChart, PieChart, LineChart, Download, Filter, X, Check } from "lucide-react";
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

type DataRow = Record<string, any>;
type ChartType = "bar" | "line" | "pie" | "area";
type FileType = "csv" | "json" | "excel";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function DataVisualization() {
  // State management
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "visualization">("table");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [xAxis, setXAxis] = useState<string>("");
  const [yAxis, setYAxis] = useState<string>("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  // Process and filter data
  const { filteredData, numericColumns } = useMemo(() => {
    if (data.length === 0) return { filteredData: [], numericColumns: [] };

    const numericCols = Object.keys(data[0]).filter(key => 
      data.some(row => !isNaN(parseFloat(row[key])))
    );

    const filtered = data.filter(row => 
      Object.entries(filters).every(([key, value]) => 
        String(row[key]).toLowerCase().includes(value.toLowerCase())
      )
    );

    return { filteredData: filtered, numericColumns: numericCols };
  }, [data, filters]);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");
    setFilters({});
    setXAxis("");
    setYAxis("");
    setSelectedColumns([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let jsonData: DataRow[] = [];

        if (file.name.endsWith('.csv')) {
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          jsonData = XLSX.utils.sheet_to_json<DataRow>(worksheet);
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          jsonData = XLSX.utils.sheet_to_json<DataRow>(worksheet);
        } else if (file.name.endsWith('.json')) {
          jsonData = JSON.parse(data as string);
        } else {
          throw new Error("Unsupported file format");
        }

        if (jsonData.length === 0) {
          throw new Error("No data found in the file");
        }

        setData(jsonData);
        const columns = Object.keys(jsonData[0]);
        setSelectedColumns(columns.slice(0, Math.min(5, columns.length)));
        if (columns.length > 0) setXAxis(columns[0]);
        if (columns.length > 1) {
          const firstNumeric = columns.find(col => 
            jsonData.some(row => !isNaN(parseFloat(row[col])))
          );
          setYAxis(firstNumeric || columns[1]);
        }
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

    if (file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  // Export data
  const exportData = (format: FileType) => {
    if (filteredData.length === 0) return;
    
    try {
      if (format === 'csv' || format === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
        XLSX.writeFile(workbook, `export.${format === 'csv' ? 'csv' : 'xlsx'}`);
      } else {
        const blob = new Blob([JSON.stringify(filteredData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'export.json';
        a.click();
      }
    } catch (err) {
      setError("Failed to export data");
    }
  };

  // Toggle column selection
  const toggleColumn = (column: string) => {
    setSelectedColumns(prev => 
      prev.includes(column) 
        ? prev.filter(c => c !== column) 
        : [...prev, column]
    );
  };

  // Calculate statistics
  const calculateStats = (column: string) => {
    const values = filteredData.map(row => parseFloat(row[column])).filter(v => !isNaN(v));
    if (values.length === 0) return null;

    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    return { avg, max, min };
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Data Visualization Dashboard</CardTitle>
          {data.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => {
                setData([]);
                setFilters({});
              }}
            >
              Clear Data
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input 
                id="file-upload"
                type="file" 
                accept=".csv,.xlsx,.xls,.json" 
                onChange={handleFileUpload}
                disabled={loading}
              />
            </div>
            {data.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => exportData('csv')}>
                  <Download className="mr-2 h-4 w-4" /> CSV
                </Button>
                <Button variant="outline" onClick={() => exportData('excel')}>
                  <Download className="mr-2 h-4 w-4" /> Excel
                </Button>
                <Button variant="outline" onClick={() => exportData('json')}>
                  <Download className="mr-2 h-4 w-4" /> JSON
                </Button>
              </div>
            )}
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <p className="text-sm text-muted-foreground mt-2">
            Supported formats: .xlsx, .xls, .csv, .json
          </p>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            <p>Processing your data...</p>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {filteredData.length > 0 && !loading && (
        <>
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Total Rows</div>
                <div className="text-2xl font-bold">{filteredData.length.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Columns</div>
                <div className="text-2xl font-bold">{Object.keys(filteredData[0]).length}</div>
              </CardContent>
            </Card>
            {yAxis && calculateStats(yAxis) && (
              <>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Avg ({yAxis})</div>
                    <div className="text-2xl font-bold">
                      {calculateStats(yAxis)?.avg.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Max ({yAxis})</div>
                    <div className="text-2xl font-bold">
                      {calculateStats(yAxis)?.max.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* View Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                onClick={() => setViewMode('table')}
              >
                <Table className="mr-2 h-4 w-4" /> Table
              </Button>
              <Button
                variant={viewMode === 'visualization' ? 'default' : 'outline'}
                onClick={() => setViewMode('visualization')}
              >
                <BarChart className="mr-2 h-4 w-4" /> Visualize
              </Button>
            </div>

            {viewMode === 'table' && (
              <Button
                variant={showFilters ? 'default' : 'outline'}
                onClick={() => setShowFilters(!showFilters)}
                className="ml-auto"
              >
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            )}

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
                <Button
                  variant={chartType === 'area' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('area')}
                >
                  Area
                </Button>
              </div>
            )}
          </div>

          {/* Filters */}
          {showFilters && viewMode === 'table' && (
            <Card>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.keys(data[0]).map(column => (
                  <div key={`filter-${column}`}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter {column}
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={filters[column] || ''}
                        onChange={(e) => setFilters({...filters, [column]: e.target.value})}
                        placeholder={`Filter ${column}...`}
                        className="flex-1"
                      />
                      {filters[column] && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            const newFilters = {...filters};
                            delete newFilters[column];
                            setFilters(newFilters);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Column Selection for Table */}
          {viewMode === 'table' && (
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Visible Columns</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(data[0]).map(column => (
                      <Button
                        key={`col-${column}`}
                        variant={selectedColumns.includes(column) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleColumn(column)}
                      >
                        {column}
                        {selectedColumns.includes(column) && (
                          <Check className="ml-2 h-3 w-3" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Column Selection for Visualizations */}
          {viewMode === 'visualization' && (
            <Card>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">X-Axis</label>
                  <select
                    value={xAxis}
                    onChange={(e) => setXAxis(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2"
                  >
                    <option value="">Select column</option>
                    {Object.keys(data[0]).map(col => (
                      <option key={`x-${col}`} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Y-Axis</label>
                  <select
                    value={yAxis}
                    onChange={(e) => setYAxis(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2"
                  >
                    <option value="">Select column</option>
                    {numericColumns.map(col => (
                      <option key={`y-${col}`} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Display */}
          {viewMode === 'table' ? (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {selectedColumns.map((key) => (
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
                      {filteredData.slice(0, 100).map((row, i) => (
                        <tr key={i}>
                          {selectedColumns.map((key, j) => (
                            <td 
                              key={`${i}-${j}`} 
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            >
                              {String(row[key])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredData.length > 100 && (
                  <div className="p-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Showing first 100 rows of {filteredData.length.toLocaleString()} total rows
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 h-[500px]">
                {xAxis && yAxis ? (
                  <>
                    {chartType === 'bar' && (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={filteredData.slice(0, 100)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey={xAxis} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey={yAxis} fill="#8884d8">
                            {filteredData.slice(0, 100).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    )}

                    {chartType === 'line' && (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart data={filteredData.slice(0, 100)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey={xAxis} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey={yAxis} 
                            stroke="#8884d8" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    )}

                    {chartType === 'pie' && (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={filteredData.slice(0, 20)}
                            dataKey={yAxis}
                            nameKey={xAxis}
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            innerRadius={60}
                            paddingAngle={5}
                            label
                          >
                            {filteredData.slice(0, 20).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    )}

                    {chartType === 'area' && (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart data={filteredData.slice(0, 100)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey={xAxis} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey={yAxis} 
                            stroke="#8884d8" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                            fill="#8884d8"
                            fillOpacity={0.3}
                          />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-gray-500 mb-4">Please select both X and Y axes</p>
                      {numericColumns.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No numeric columns found for Y-axis
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}