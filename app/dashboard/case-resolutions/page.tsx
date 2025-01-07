'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { PlusCircle, X, Plus, Trash2, Search } from 'lucide-react'
import { predefinedTags } from '@/utils/predefined-tags'
import { useAuth } from '@/contexts/AuthContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  CaseResolution, 
  ResolutionStep,
  createCaseResolution,
  getCaseResolutions,
  deleteCaseResolution
} from '@/lib/firebase/case-resolutions'
import { ImageAttachment } from "@/components/ui/image-attachment"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from '@/contexts/LanguageContext'
import { uploadImage, getPublicUrl } from '@/lib/upload'
import { User } from 'firebase/auth'


export default function CaseResolutions() {
  const [resolutions, setResolutions] = useState<CaseResolution[]>([])
  const [newResolution, setNewResolution] = useState<Omit<CaseResolution, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>({
    title: '',
    description: '',
    descriptionImages: [],
    steps: [],
    tags: [],
    isPublished: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const { user } = useAuth()
  const { t } = useLanguage();
  const { toast } = useToast()
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all')

  useEffect(() => {
    if (user) {
      loadResolutions()
    } else {
      setIsInitialLoading(false)
    }
  }, [user])

  const loadResolutions = async () => {
    if (!user) {
      setIsInitialLoading(false)
      return
    }
    
    try {
      setIsLoading(true)
      const loadedResolutions = await getCaseResolutions(user as unknown as User)
      setResolutions(loadedResolutions as unknown as CaseResolution[])
    } catch (error) {
      console.error('Error loading resolutions:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : t("Failed to load case resolutions. Please try again later."),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsInitialLoading(false)
    }
  }

  const handleAddStep = () => {
    const newStep: ResolutionStep = {
      id: Date.now().toString(),
      content: '',
      images: [],
      links: []
    }
    setNewResolution(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }))
  }

  const handleStepChange = (id: string, content: string) => {
    setNewResolution(prev => ({
      ...prev,
      steps: prev.steps.map(step => {
        if (step.id === id) {
          return { ...step, content }
        }
        return step
      })
    }))
  }

  const handleRemoveStep = (id: string) => {
    setNewResolution(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== id)
    }))
  }

  const handleTagToggle = (tag: string) => {
    setNewResolution(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const handleImageTag = (stepId: string, imageUrl: string, tag: string) => {
    setNewResolution(prev => ({
      ...prev,
      steps: prev.steps.map(step => {
        if (step.id === stepId) {
          return {
            ...step,
            images: [...step.images, imageUrl]
          }
        }
        return step
      })
    }))
  }

  const handleDescriptionImageTag = (imageUrl: string) => {
    setNewResolution(prev => ({
      ...prev,
      descriptionImages: [...prev.descriptionImages, imageUrl]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "Error",
        description: t("You must be logged in to create a resolution."),
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await createCaseResolution(user as unknown as User, newResolution as unknown as Omit<CaseResolution, 'id' | 'userId' | 'createdAt' | 'updatedAt'>)
      setNewResolution({ title: '', description: '', descriptionImages: [], steps: [], tags: [], isPublished: false })
      loadResolutions()
      toast({
        title: "Success",
        description: t("Case resolution created successfully."),
      })
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error creating resolution:', error)
      toast({
        title: "Error",
        description: t("Failed to create case resolution. Please try again."),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (resolution: CaseResolution) => {
    if (!user) {
      toast({
        title: "Error",
        description: t("You must be logged in to delete a resolution."),
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      await deleteCaseResolution(user as unknown as User, resolution.id)
      setResolutions(prev => prev.filter(r => r.id !== resolution.id))
      toast({
        title: "Success",
        description: t("Case resolution deleted successfully."),
      })
    } catch (error) {
      console.error('Error deleting resolution:', error)
      toast({
        title: "Error",
        description: t("Failed to delete case resolution."),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const extractLinks = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const links = content.match(urlRegex) || []
    return links.map(url => ({
      url,
      description: '',
      image: '/placeholder.svg?height=60&width=60'
    }))
  }

  const renderContent = (content: string, links: { url: string; description: string; image: string }[]) => {
    let renderedContent = content
    links.forEach((link, index) => {
      renderedContent = renderedContent.replace(
        link.url,
        `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${t('link')} ${index + 1}</a>`
      )
    })
    return <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
  }

  const filteredResolutions = resolutions.filter(resolution => {
    const matchesSearch = resolution.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          resolution.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = selectedTagFilter === 'all' || resolution.tags.includes(selectedTagFilter)
    return matchesSearch && matchesTag
  })

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold">{t('Please log in to view case resolutions.')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('Case Resolutions')}</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> {t('New Resolution')}
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
          <div className="relative flex-grow">
            <Input
              placeholder={t('Search resolutions...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
          <Select value={selectedTagFilter} onValueChange={setSelectedTagFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('Filter by tag')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('All tags')}</SelectItem>
              {predefinedTags.map(tag => (
                <SelectItem key={tag.name} value={tag.name}>{tag.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {filteredResolutions.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-500">
            {t('No resolutions found matching your search criteria.')}
          </div>
        ) : (
          filteredResolutions.map((resolution) => (
            <div key={resolution.id} className="p-4 bg-white rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{resolution.title}</h3>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('Are you sure?')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('This action cannot be undone. This will permanently delete the case resolution and all its associated data.')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(resolution)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        {t('Delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {resolution.tags.map((tag) => {
                  const tagConfig = predefinedTags.find(t => t.name === tag)
                  return (
                    <span
                      key={tag}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tagConfig?.color || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {tag}
                    </span>
                  )
                })}
                {resolution.isPublished && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {t('Published')}
                  </span>
                )}
              </div>
              <div className="mb-4">
                {renderContent(resolution.description, resolution.steps[0]?.links || [])}
              </div>
              {resolution.descriptionImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {resolution.descriptionImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${t('Description image')} ${index + 1}`}
                      className="h-[120px] w-[120px] object-cover rounded cursor-pointer"
                      onClick={() => setFullscreenImage(image)}
                    />
                  ))}
                </div>
              )}
              <div className="space-y-4">
                {resolution.steps.map((step, index) => (
                  <div key={step.id} className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <span className="font-semibold">{t('Step')} {index + 1}:</span>
                      {renderContent(step.content, step.links)}
                    </div>
                    {step.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 ml-6">
                        {step.images.map((image, imageIndex) => (
                          <img
                            key={imageIndex}
                            src={image}
                            alt={`${t('Step')} ${index + 1} ${t('image')}`}
                            className="h-[120px] w-[120px] object-cover rounded cursor-pointer"
                            onClick={() => setFullscreenImage(image)}
                          />
                        ))}
                      </div>
                    )}
                    {step.links.length > 0 && (
                      <div className="ml-6 space-y-2">
                        {step.links.map((link, linkIndex) => (
                          <div key={linkIndex} className="flex items-center space-x-2">
                            <img src={link.image} alt="" className="w-8 h-8 rounded" />
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              {link.description || link.url}
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {t('Created')}: {resolution.createdAt.toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{t('Create New Case Resolution')}</DialogTitle>
            <DialogDescription>
              {t('Create a new case resolution. Click save when you\'re done.')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t('Title')}</Label>
                <Input
                  id="title"
                  value={newResolution.title}
                  onChange={(e) => setNewResolution({ ...newResolution, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{t('Tags')}</Label>
                <div className="flex flex-wrap gap-2">
                  {predefinedTags.map((tag) => (
                    <button
                      key={tag.name}
                      type="button"
                      onClick={() => handleTagToggle(tag.name)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        newResolution.tags.includes(tag.name)
                          ? tag.color
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('Issue Description')}</Label>
                <Textarea
                  id="description"
                  value={newResolution.description}
                  onChange={(e) => {
                    const newDescription = e.target.value
                    const links = extractLinks(newDescription)
                    setNewResolution({
                      ...newResolution,
                      description: newDescription,
                      steps: newResolution.steps.map(step => ({
                        ...step,
                        links: links
                      }))
                    })
                  }}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{t('Description Images')}</Label>
                <ImageAttachment
                  onImageUpload={(file) => {
                    // This is a placeholder. In a real app, you'd upload the file and get a URL
                    const fakeUrl = URL.createObjectURL(file)
                    return Promise.resolve(fakeUrl)
                  }}
                  onImageTag={(imageUrl) => handleDescriptionImageTag(imageUrl)}
                  maxImages={5}
                  currentCount={newResolution.descriptionImages.length}
                  isUploading={isLoading}
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>{t('Resolution Steps')}</Label>
                  <Button type="button" variant="outline" onClick={handleAddStep}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    {t('Add Step')}
                  </Button>
                </div>
                
                {newResolution.steps.map((step, index) => (
                  <div key={step.id} className="space-y-2 p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">{t('Step')} {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveStep(step.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Textarea
                      value={step.content}
                      onChange={(e) => {
                        const newContent = e.target.value
                        const links = extractLinks(newContent)
                        handleStepChange(step.id, newContent)
                        setNewResolution(prev => ({
                          ...prev,
                          steps: prev.steps.map(s => 
                            s.id === step.id ? { ...s, links } : s
                          )
                        }))
                      }}
                      placeholder={t('Describe this step...')}
                      required
                    />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>{t('Images')} ({step.images.length}/5)</Label>
                      </div>
                      
                      <ImageAttachment
                        onImageUpload={(file) => {
                          // This is a placeholder. In a real app, you'd upload the file and get a URL
                          const fakeUrl = URL.createObjectURL(file)
                          return Promise.resolve(fakeUrl)
                        }}
                        onImageTag={(imageUrl, tag) => handleImageTag(step.id, imageUrl, tag)}
                        maxImages={5}
                        currentCount={step.images.length}
                        isUploading={isLoading}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="publish"
                  checked={newResolution.isPublished}
                  onCheckedChange={(checked) => setNewResolution({ ...newResolution, isPublished: checked })}
                />
                <Label htmlFor="publish">{t('Publish resolution')}</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t('Creating...') : t('Create Resolution')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!fullscreenImage} onOpenChange={() => setFullscreenImage(null)}>
        <DialogContent className="max-w-[75vw] h-[75vh]">
          <DialogHeader>
            <DialogTitle>{t('Image Preview')}</DialogTitle>
            <DialogDescription>{t('Click outside to close')}</DialogDescription>
          </DialogHeader>
          {fullscreenImage && (
            <div className="flex items-center justify-center h-full">
              <img
                src={fullscreenImage}
                alt={t('Full size preview')}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

