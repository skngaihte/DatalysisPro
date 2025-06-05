import { useState } from 'react'
import { Button } from './ui/button'
import { Upload, Loader2 } from 'lucide-react'
import { useToast } from './ui/use-toast'

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>
}

export default function FileUpload({ onUpload }: FileUploadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/json']
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a CSV or JSON file',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsLoading(true)
      await onUpload(file)
      toast({
        title: 'Upload Successful',
        description: 'Your file has been processed',
      })
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: 'There was an error processing your file',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-gray-500">Processing your file...</p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4 flex justify-center text-sm text-gray-600">
              <label htmlFor="file-upload" className="relative cursor-pointer">
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".csv,.json,.xlsx"
                  onChange={handleFileChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              CSV, JSON up to 10MB
            </p>
          </>
        )}
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => document.getElementById('file-upload')?.click()}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        Select File
      </Button>
    </div>
  )
}