"use client";

import { useState, useRef } from 'react';
import { Button } from "/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "/components/ui/card";
import { Input } from "/components/ui/input";
import { Home, Upload, Shield, Users, Clock, Search, User, Check, ArrowRight, X } from 'lucide-react';

type AnalysisResult = {
  summary: {
    records: number;
    columns: number;
    anomalies: number;
    completeness: string;
  };
  charts: {
    name: string;
    type: string;
    data: { name: string; value: number }[];
  }[];
  insights: string[];
};

export default function DataInsightPro() {
  // State management
  const [activeTab, setActiveTab] = useState('home');
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock analysis function
  const analyzeData = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setResults({
        summary: {
          records: Math.floor(Math.random() * 10000),
          columns: Math.floor(Math.random() * 15) + 5,
          anomalies: Math.floor(Math.random() * 50),
          completeness: `${Math.floor(Math.random() * 15) + 85}%`
        },
        charts: [
          {
            name: 'Distribution',
            type: 'bar',
            data: [
              { name: 'Group A', value: 400 },
              { name: 'Group B', value: 300 },
              { name: 'Group C', value: 600 }
            ]
          },
          {
            name: 'Trends',
            type: 'line',
            data: [
              { name: 'Jan', value: 400 },
              { name: 'Feb', value: 300 },
              { name: 'Mar', value: 600 }
            ]
          }
        ],
        insights: [
          'Strong correlation between X and Y variables',
          'Seasonal patterns detected in time series',
          '12% of records contain missing values'
        ]
      });
      setIsAnalyzing(false);
      setActiveTab('dashboard');
    }, 2000);
  };

  // Tab content components
  const HomeTab = () => (
    <div className="grid md:grid-cols-2 gap-8 items-center w-full">
      <div>
        <h1 className="text-3xl font-bold mb-4">Data Insights in Seconds</h1>
        <p className="text-lg mb-6">Upload your dataset and get automatic analysis with actionable insights.</p>
        <div className="flex gap-4">
          <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
            <Upload size={18} /> Upload Data
          </Button>
          <Button variant="outline" onClick={() => setActiveTab('features')}>
            Learn More
          </Button>
        </div>
        <div className="mt-6 flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield size={16} /> Secure Processing
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} /> Instant Results
          </div>
        </div>
      </div>
      <Card className="border-primary/30 w-full">
        <CardHeader>
          <CardTitle>Sample Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Records</p>
            <p className="text-2xl font-bold">1,248</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Data Quality</p>
            <p className="text-2xl font-bold">96%</p>
          </div>
          <div className="col-span-2 border rounded-lg p-4 h-32 flex items-center justify-center">
            <p className="text-muted-foreground">Visualization Preview</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const FeaturesTab = () => (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-8">Key Features</h2>
      <div className="grid md:grid-cols-3 gap-6 w-full">
        {[
          { icon: <Search size={24} />, title: "Smart Detection", desc: "Automated pattern recognition" },
          { icon: <Shield size={24} />, title: "Data Quality", desc: "Comprehensive quality reports" },
          { icon: <Users size={24} />, title: "Team Sharing", desc: "Collaborate with your team" }
        ].map((feature, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow w-full">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const DashboardTab = () => (
    <div className="space-y-6 w-full">
      <div className="flex justify-between items-center w-full">
        <div>
          <h2 className="text-2xl font-bold">Analysis Results</h2>
          <p className="text-muted-foreground">{file?.name}</p>
        </div>
        <Button variant="outline" onClick={() => setActiveTab('home')}>
          <ArrowRight className="mr-2 h-4 w-4 rotate-180" /> Back
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        {results && Object.entries(results.summary).map(([key, value]) => (
          <Card key={key} className="w-full">
            <CardHeader className="pb-2">
              <p className="text-sm text-muted-foreground capitalize">{key}</p>
              <CardTitle className="text-xl">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Visualizations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {results?.charts.map((chart, i) => (
            <div key={i} className="border rounded-lg p-6 w-full">
              <h3 className="font-medium mb-4">{chart.name}</h3>
              <div className="flex items-end h-48 gap-2">
                {chart.data.map((d, j) => (
                  <div key={j} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-primary/20 rounded-t"
                      style={{ height: `${(d.value / 600) * 100}%` }}
                    >
                      <div className="bg-primary h-full rounded-t"></div>
                    </div>
                    <p className="text-xs mt-2 text-muted-foreground">{d.name}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {results?.insights.map((insight, i) => (
              <li key={i} className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <p>{insight}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10 w-full">
        <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold">DataInsight Pro</span>
          </div>
          <nav className="hidden md:flex gap-6">
            {['home', 'features', 'dashboard'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${activeTab === tab ? 'text-primary' : 'text-muted-foreground'} capitalize`}
              >
                {tab}
              </button>
            ))}
          </nav>
          <Button size="sm">Sign In</Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full py-8 px-4 sm:px-6 lg:px-8">
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p>Analyzing your data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'home' && <HomeTab />}
            {activeTab === 'features' && <FeaturesTab />}
            {activeTab === 'dashboard' && results ? <DashboardTab /> : <HomeTab />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} DataInsight Pro. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Hidden file input */}
      <Input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            analyzeData();
          }
        }}
        accept=".csv,.xlsx,.json"
      />
    </div>
  );
}