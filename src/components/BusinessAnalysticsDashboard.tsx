import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, BarChart, PieChart, LineChart, Download, Filter, X, Check, Upload, ChevronDown } from "lucide-react";
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
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { Progress } from "@/components/ui/progress";

type DataRow = Record<string, any>;
type ChartType = "bar" | "line" | "pie" | "area";
type FileType = "csv" | "json" | "excel";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function BusinessAnalyticsDashboard() {
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
  const [fileName, setFileName] = useState("");

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
    setFileName(file.name);

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

    return { avg, max, min, sum };
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };

  // Format percentage
  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Upload your financial data to visualize and analyze trends
          </p>
        </div>
        {data.length > 0 && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setData([]);
                setFilters({});
                setFileName("");
              }}
            >
              Clear Data
            </Button>
          </div>
        )}
      </div>

      {/* File Upload Section */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            <span>Upload Your Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2">
                <label 
                  htmlFor="file-upload"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-600/90 h-10 px-4 py-2 w-full sm:w-auto cursor-pointer"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </label>
                <span className="text-sm text-gray-600 truncate max-w-[200px]">
                  {fileName || "No file selected"}
                </span>
              </div>
              <Input 
                id="file-upload"
                type="file" 
                accept=".csv,.xlsx,.xls,.json" 
                onChange={handleFileUpload}
                disabled={loading}
                className="hidden"
              />
            </div>
            {data.length > 0 && (
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  onClick={() => exportData('excel')}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export Excel</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => exportData('csv')}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export CSV</span>
                </Button>
              </div>
            )}
          </div>
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          <p className="text-xs text-muted-foreground mt-2">
            Supported formats: .xlsx, .xls, .csv, .json
          </p>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            <p>Processing your data...</p>
            <Progress value={50} className="w-[60%] h-2" />
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
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Records</div>
                    <div className="text-2xl font-bold">{filteredData.length.toLocaleString()}</div>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Table className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Columns</div>
                    <div className="text-2xl font-bold">{Object.keys(filteredData[0]).length}</div>
                  </div>
                  <div className="bg-green-100 p-2 rounded-full">
                    <BarChart className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            {yAxis && calculateStats(yAxis) && (
              <>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">Avg {yAxis}</div>
                        <div className="text-2xl font-bold">
                          {formatCurrency(calculateStats(yAxis)?.avg || 0)}
                        </div>
                      </div>
                      <div className="bg-yellow-100 p-2 rounded-full">
                        <PieChart className="h-5 w-5 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">Total {yAxis}</div>
                        <div className="text-2xl font-bold">
                          {formatCurrency(calculateStats(yAxis)?.sum || 0)}
                        </div>
                      </div>
                      <div className="bg-purple-100 p-2 rounded-full">
                        <LineChart className="h-5 w-5 text-purple-600" />
                      </div>
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
                className="gap-2"
              >
                <Table className="h-4 w-4" />
                <span>Table View</span>
              </Button>
              <Button
                variant={viewMode === 'visualization' ? 'default' : 'outline'}
                onClick={() => setViewMode('visualization')}
                className="gap-2"
              >
                <BarChart className="h-4 w-4" />
                <span>Visualization</span>
              </Button>
            </div>

            {viewMode === 'table' && (
              <div className="flex gap-2 ml-auto">
                <Button
                  variant={showFilters ? 'default' : 'outline'}
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setSelectedColumns(Object.keys(data[0]))}
                >
                  <Check className="h-4 w-4" />
                  <span>Select All</span>
                </Button>
              </div>
            )}

            {viewMode === 'visualization' && (
              <div className="flex gap-2 ml-auto">
                <div className="relative">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setChartType('bar')}
                  >
                    <BarChart className="h-4 w-4" />
                    <span>Bar</span>
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setChartType('line')}
                >
                  <LineChart className="h-4 w-4" />
                  <span>Line</span>
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setChartType('pie')}
                >
                  <PieChart className="h-4 w-4" />
                  <span>Pie</span>
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setChartType('area')}
                >
                  <AreaChart className="h-4 w-4" />
                  <span>Area</span>
                </Button>
              </div>
            )}
          </div>

          {/* Filters */}
          {showFilters && viewMode === 'table' && (
            <Card>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.keys(data[0]).map(column => (
                  <div key={`filter-${column}`} className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
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
                        className="gap-2"
                      >
                        {selectedColumns.includes(column) && (
                          <Check className="h-3 w-3" />
                        )}
                        {column}
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
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">X-Axis (Category)</label>
                  <select
                    value={xAxis}
                    onChange={(e) => setXAxis(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select column</option>
                    {Object.keys(data[0]).map(col => (
                      <option key={`x-${col}`} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Y-Axis (Value)</label>
                  <select
                    value={yAxis}
                    onChange={(e) => setYAxis(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                            <div className="flex items-center gap-1">
                              {key}
                              <ChevronDown className="h-3 w-3 opacity-50" />
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredData.slice(0, 100).map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          {selectedColumns.map((key, j) => {
                            const value = row[key];
                            const isNumeric = !isNaN(parseFloat(value));
                            const isPercent = typeof value === 'string' && value.includes('%');
                            
                            return (
                              <td 
                                key={`${i}-${j}`} 
                                className="px-6 py-4 whitespace-nowrap text-sm"
                              >
                                {isNumeric ? (
                                  isPercent ? (
                                    <span className="text-blue-600 font-medium">
                                      {formatPercent(parseFloat(value))}
                                    </span>
                                  ) : (
                                    <span className="text-gray-900 font-medium">
                                      {formatCurrency(parseFloat(value))}
                                    </span>
                                  )
                                ) : (
                                  <span className="text-gray-500">
                                    {String(value)}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredData.length > 100 && (
                  <CardFooter className="p-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Showing first 100 rows of {filteredData.length.toLocaleString()} total rows
                    </p>
                  </CardFooter>
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
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey={xAxis} 
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            tickFormatter={(value) => formatCurrency(value)}
                          />
                          <Tooltip 
                            formatter={(value) => [formatCurrency(Number(value)), yAxis]}
                            labelFormatter={(label) => `${xAxis}: ${label}`}
                          />
                          <Legend />
                          <Bar dataKey={yAxis} name={yAxis}>
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
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey={xAxis} 
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            tickFormatter={(value) => formatCurrency(value)}
                          />
                          <Tooltip 
                            formatter={(value) => [formatCurrency(Number(value)), yAxis]}
                            labelFormatter={(label) => `${xAxis}: ${label}`}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey={yAxis} 
                            name={yAxis}
                            stroke="#3b82f6" 
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
                            label={({ name, percent }) => `${name}: ${formatPercent(percent)}`}
                          >
                            {filteredData.slice(0, 20).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => formatCurrency(Number(value))}
                          />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    )}

                    {chartType === 'area' && (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={filteredData.slice(0, 100)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey={xAxis} 
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            tickFormatter={(value) => formatCurrency(value)}
                          />
                          <Tooltip 
                            formatter={(value) => [formatCurrency(Number(value)), yAxis]}
                            labelFormatter={(label) => `${xAxis}: ${label}`}
                          />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey={yAxis} 
                            name={yAxis}
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.2}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <BarChart className="h-12 w-12 text-gray-400" />
                    <p className="text-gray-500 text-center">
                      {!xAxis && !yAxis 
                        ? "Please select both X and Y axes to visualize your data" 
                        : !xAxis 
                          ? "Please select an X-axis column" 
                          : "Please select a Y-axis column"}
                    </p>
                    {numericColumns.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No numeric columns found for Y-axis
                      </p>
                    )}
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