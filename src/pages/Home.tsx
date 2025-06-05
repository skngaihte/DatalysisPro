import FileUpload from "../components/FileUpload"
import { Card } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Home({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const handleUpload = async (file: File) => {
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500))
    setActiveTab('dashboard')
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Data Analysis Made Simple</h1>
        <p className="text-xl text-gray-600">
          Upload your data and get instant insights with our AI-powered analytics platform.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto mb-12">
        <div className="p-8 text-center">
          <FileUpload onUpload={handleUpload} />
        </div>
      </Card>

      <div className="flex justify-center">
        <Button variant="outline" onClick={() => setActiveTab('features')}>
          Explore Features <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
