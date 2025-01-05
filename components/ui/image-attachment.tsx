'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageIcon, X, LinkIcon } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ImageAttachmentProps {
  onImageUpload: (file: File) => Promise<string>
  onImageTag: (imageUrl: string, tag: string) => void
  maxImages?: number
  currentCount: number
  isUploading?: boolean
}

export function ImageAttachment({
  onImageUpload,
  onImageTag,
  maxImages = 5,
  currentCount,
  isUploading = false
}: ImageAttachmentProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageTag, setImageTag] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isTagging, setIsTagging] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)

  const handleFileSelect = async (file: File) => {
    try {
      const imageUrl = await onImageUpload(file)
      setUploadedImageUrl(imageUrl)
      setIsTagging(true)
    } catch (error) {
      console.error('Error uploading image:', error)
    }
  }

  const handleTagSubmit = useCallback(() => {
    if (uploadedImageUrl && imageTag) {
      onImageTag(uploadedImageUrl, imageTag)
      setImageTag('')
      setIsTagging(false)
      setUploadedImageUrl(null)
    }
  }, [uploadedImageUrl, imageTag, onImageTag])

  if (currentCount >= maxImages) {
    return null
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Attach Image
        </Button>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileSelect(file)
          }}
        />
      </div>

      <Dialog open={isTagging} onOpenChange={setIsTagging}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tag Image</DialogTitle>
            <DialogDescription>
              Add a tag to reference this image in your text using @tag
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="imageTag">Image Tag</Label>
              <Input
                id="imageTag"
                value={imageTag}
                onChange={(e) => setImageTag(e.target.value)}
                placeholder="Enter a tag for this image"
              />
            </div>
            {uploadedImageUrl && (
              <img
                src={uploadedImageUrl}
                alt="Preview"
                className="w-full max-h-48 object-contain"
              />
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsTagging(false)
                  setUploadedImageUrl(null)
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleTagSubmit}
                disabled={!imageTag}
              >
                Add Tag
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

