import React, { useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onRemove: () => void
  accept?: string
  maxSize?: number
  label?: string
  selectedFileName?: string
}

export function FileUpload({
  onFileSelect,
  onRemove,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB
  label = "Upload File",
  selectedFileName
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (file: File) => {
    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: `File size should be less than ${maxSize / 1024 / 1024}MB`,
        variant: "destructive",
      })
      return
    }
    onFileSelect(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="file-upload">{label}</Label>
      <div
        className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer ${
          isDragging ? 'border-primary' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {selectedFileName ? (
          <div className="flex items-center justify-between">
            <span className="truncate">{selectedFileName}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-1 text-sm text-gray-600">
              Click or drag file to this area to upload
            </p>
          </div>
        )}
      </div>
      <Input
        id="file-upload"
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileSelect(file)
        }}
      />
    </div>
  )
}

