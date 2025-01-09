'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { PlusCircle, X, Plus, Trash2, Search, Edit } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getCaseResolutions, deleteCaseResolution, updateCaseResolution, createCaseResolution, CaseResolution } from '@/lib/firebase/case-resolutions'
import { useAuth } from '@/contexts/AuthContext'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { caseResolutionTags } from '@/utils/case-resolution-tags'
import { ImageAttachment } from "@/components/ui/image-attachment"
import { Switch } from "@/components/ui/switch"
import { User } from 'firebase/auth'

export default function CaseResolutions() {
  const { user } = useAuth()
  const [resolutions, setResolutions] = useState<CaseResolution[]>([])
  const [newResolution, setNewResolution] = useState<Partial<CaseResolution>>({
    title: '',
    description: '',
    tags: [],
    steps: [],
    isPrivate: false,
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editResolution, setEditResolution] = useState<CaseResolution | null>(null)
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all')

  useEffect(() => {
    const fetchResolutions = async () => {
      if (!user) return;
      try {
        const fetchedResolutions = await getCaseResolutions(user as unknown as User);
        setResolutions(fetchedResolutions);
      } catch (error) {
        console.error('Error fetching resolutions:', error);
        toast({
          title: "Error",
          description: "Failed to load case resolutions. Please try again later.",
          variant: "destructive",
        });
      }
    };

    fetchResolutions();
  }, [user]);

  const handleDelete = async (resolutionId: string) => {
    if (!user) return;
    try {
      await deleteCaseResolution(user as unknown as User, resolutionId)
      setResolutions(prev => prev.filter(resolution => resolution.id !== resolutionId))
      toast({
        title: 'Resolution Deleted',
        description: 'The resolution has been deleted successfully.',
      })
    } catch (error) {
      console.error('Error deleting resolution:', error)
      toast({
        title: "Error",
        description: 'Failed to delete resolution. Please try again later.',
        variant: "destructive",
      })
    }
  }

  const handleEditButtonClick = (resolution: CaseResolution) => {
    setEditResolution({
      ...resolution,
      id: resolution.id,
      userId: resolution.userId,
      title: resolution.title || '',
      description: resolution.description || '',
      steps: resolution.steps || [],
      tags: resolution.tags || [],
      isPrivate: resolution.isPrivate ?? false,
      createdAt: resolution.createdAt || new Date(),
      updatedAt: resolution.updatedAt || new Date()
    });
    setIsEditDialogOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editResolution || !user) return;

    try {
      await updateCaseResolution(user as unknown as User, editResolution.id, {
        title: editResolution.title,
        description: editResolution.description,
        steps: editResolution.steps,
        tags: editResolution.tags,
        isPrivate: editResolution.isPrivate,
      });
      setResolutions(prev => prev.map(resolution => resolution.id === editResolution.id ? editResolution : resolution));
      toast({
        title: 'Resolution Updated',
        description: 'The resolution has been updated successfully.',
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating resolution:', error);
      toast({
        title: "Error",
        description: 'Failed to update resolution. Please try again later.',
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return;
    try {
      const resolutionToCreate = {
        ...newResolution,
        title: newResolution.title || '',
        description: newResolution.description || '',
        steps: newResolution.steps || [],
        tags: newResolution.tags || [],
        isPrivate: newResolution.isPrivate ?? false
      };

      const createdResolution = await createCaseResolution(
        user as unknown as User, 
        resolutionToCreate as Omit<CaseResolution, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
      );

      toast({
        title: 'Resolution Created',
        description: 'The resolution has been created successfully.',
      })
      setIsDialogOpen(false)
      setResolutions(prev => [...prev, createdResolution])
    } catch (error) {
      console.error('Error creating resolution:', error)
      toast({
        title: "Error",
        description: 'Failed to create resolution. Please try again later.',
        variant: "destructive",
      })
    }
  }

  const handleLinkChange = (stepIndex: number, linkIndex: number, newValue: string) => {
    const steps = newResolution.steps || [];
    const updatedLinks = steps[stepIndex].links.map((link, index) => 
      index === linkIndex ? { ...link, url: newValue } : link
    );
    steps[stepIndex] = { ...steps[stepIndex], links: updatedLinks };
    setNewResolution({ ...newResolution, steps });
  };

  const filteredResolutions = resolutions.filter(resolution => {
    const matchesSearch = resolution.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          resolution.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTagFilter === 'all' || (resolution.tags && resolution.tags.includes(selectedTagFilter));
    
    // Show all non-private resolutions or user's own resolutions
    const isVisible = !resolution.isPrivate || resolution.userId === user?.uid;
    
    return matchesSearch && matchesTag && isVisible;
  });

  const isOwner = (resolutionUserId: string) => user && user.uid === resolutionUserId;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Case Resolutions</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Resolution
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 space-y-4 mb-4">
        <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
          <div className="relative flex-grow">
            <Input
              placeholder="Search resolutions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
          <Select value={selectedTagFilter} onValueChange={setSelectedTagFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-gray-500">All tags</SelectItem>
              {caseResolutionTags.map(tag => (
                <SelectItem key={tag.name} value={tag.name} className={tag.color + " rounded-full my-2 px-2 py-1 max-w-fit"}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        {filteredResolutions.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-500">
            No resolutions found matching your search criteria. Create a new resolution to get started.
          </div>
        ) : (
          filteredResolutions.map((resolution, index) => (
            <div key={`${resolution.id}-${index}`} className="p-4 bg-white rounded-lg shadow ">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{resolution.title}</h3>
                <div className="actions">
                  <Button
                    variant="ghost"
                    onClick={() => handleEditButtonClick(resolution)}
                    disabled={!isOwner(resolution.userId)}
                    className={!isOwner(resolution.userId) ? 'opacity-10 cursor-not-allowed mr-2' : 'mr-2'}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleDelete(resolution.id)}
                    disabled={!isOwner(resolution.userId)}
                    className={!isOwner(resolution.userId) ? 'opacity-10 cursor-not-allowed mr-2' : 'mr-2'}
                  >
                     <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {resolution.tags && resolution.tags.map((tag) => {
                  const tagConfig = caseResolutionTags.find(t => t.name === tag);
                  return (
                    <span
                      key={tag}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tagConfig?.color || 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {tag}
                    </span>
                  );
                })}
                {resolution.isPrivate && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-200 text-green-800">
                    Private
                  </span>
                )}
              </div>
              <div className="mb-4 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: resolution.description || '' }} />
              </div>
              {resolution.steps && resolution.steps.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {resolution.steps && resolution.steps.map((step, index) => (
                    <div key={step.id} className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <span className="font-semibold">Step {index + 1}:</span>
                        <div dangerouslySetInnerHTML={{ __html: step.content || '' }} />
                      </div>
                      {step.images && step.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 ml-6 overflow-y-auto">
                          {step.images && step.images.map((image, imageIndex) => (
                            <img
                              key={imageIndex}
                              src={image}
                              alt={`Step ${index + 1} image`}
                              className="h-[120px] w-[120px] object-cover rounded cursor-pointer"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-2 text-sm text-gray-500">
                Created: {resolution.createdAt ? resolution.createdAt.toLocaleDateString() : ''}
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Case Resolution</DialogTitle>
            <DialogDescription>
              Create a new case resolution. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newResolution.title}
                  onChange={(e) => setNewResolution({ ...newResolution, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Issue Description</Label>
                <Textarea
                  id="description"
                  value={newResolution.description}
                  onChange={(e) => setNewResolution({ ...newResolution, description: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {caseResolutionTags.map((tag) => (
                    <button
                      key={tag.name}
                      type="button"
                      onClick={() => {
                        const tags = newResolution.tags || [];
                        if (tags.includes(tag.name)) {
                          setNewResolution({ ...newResolution, tags: tags.filter(t => t !== tag.name) });
                        } else {
                          setNewResolution({ ...newResolution, tags: [...tags, tag.name] });
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        newResolution.tags && newResolution.tags.includes(tag.name)
                          ? tag.color + " rounded-full my-2 px-2 py-1 max-w-fit"
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Resolution Steps</Label>
                <Button type="button" variant="outline" onClick={() => {
                  const steps = newResolution.steps || [];
                  setNewResolution({
                    ...newResolution,
                    steps: [...steps, { id: `${steps.length}`, content: '', images: [], links: [] }]
                  });
                }}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
                {newResolution.steps && newResolution.steps.map((step, index) => (
                  <div key={step.id} className="space-y-2 p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">Step {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const steps = newResolution.steps || [];
                          setNewResolution({
                            ...newResolution,
                            steps: steps.filter((_, i) => i !== index)
                          });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      value={step.content}
                      onChange={(e) => {
                        const steps = newResolution.steps || [];
                        steps[index].content = e.target.value;
                        setNewResolution({ ...newResolution, steps });
                      }}
                      placeholder="Describe this step..."
                      required
                    />
                    <div className="flex flex-wrap gap-2 mb-4">
                      {step.links && step.links.map((link, linkIndex) => (
                        <div key={linkIndex} className="space-y-2">
                          <Label>Link {linkIndex + 1}</Label>
                          <Input type="url" value={link.url} onChange={(e) => handleLinkChange(index, linkIndex, e.target.value)} />
                        </div>
                      ))}
                    </div>
                    <ImageAttachment images={step.images || []} onImagesChange={(images: string[]) => {
                      const steps = newResolution.steps || [];
                        steps[index] = { ...steps[index], images };
                        setNewResolution({ ...newResolution, steps });
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={newResolution.isPrivate}
                  onCheckedChange={(isPrivate: boolean) => setNewResolution({ ...newResolution, isPrivate })}
                />
                <Label>Private</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Resolution</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Case Resolution</DialogTitle>
            <DialogDescription>
              Update the details of your case resolution. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editResolution?.title || ''}
                  onChange={(e) => setEditResolution(prev => prev ? { 
                    ...prev, 
                    title: e.target.value 
                  } : null)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Issue Description</Label>
                <Textarea
                  id="edit-description"
                  value={editResolution?.description || ''}
                  onChange={(e) => setEditResolution(prev => prev ? { 
                    ...prev, 
                    description: e.target.value 
                  } : null)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {caseResolutionTags.map((tag) => (
                    <button
                      key={tag.name}
                      type="button"
                      onClick={() => {
                        const tags = editResolution?.tags || [];
                        if (tags.includes(tag.name)) {
                          setEditResolution(prev => prev ? { 
                            ...prev, 
                            tags: tags.filter(t => t !== tag.name) 
                          } : null);
                        } else {
                          setEditResolution(prev => prev ? { 
                            ...prev, 
                            tags: [...tags, tag.name] 
                          } : null);
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        editResolution?.tags && editResolution.tags.includes(tag.name)
                          ? tag.color + " rounded-full my-2 px-2 py-1 max-w-fit"
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Resolution Steps</Label>
                <Button type="button" variant="outline" className="mx-2" onClick={() => setEditResolution(prev => prev ? {
                  ...prev,
                  steps: [...(prev.steps || []), { id: `${(prev.steps || []).length}`, content: '', images: [], links: [] }]
                } : null)}> 
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
                {editResolution?.steps && editResolution.steps.map((step, index) => (
                  <div key={step.id} className="space-y-2 p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">Step {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const steps = editResolution?.steps || [];
                          setEditResolution(prev => prev ? {
                            ...prev,
                            steps: (prev.steps || []).filter((_, i) => i !== index)
                          } : null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      value={step.content}
                      onChange={(e) => {
                        const steps = editResolution?.steps || [];
                        steps[index].content = e.target.value;
                        setEditResolution(prev => prev ? { 
                          ...prev, 
                          steps 
                        } : null);
                      }}
                      placeholder="Describe this step..."
                      required
                    />
                    <div className="flex flex-wrap gap-2 mb-4">
                      {step.links && step.links.map((link, linkIndex) => (
                        <div key={linkIndex} className="space-y-2">
                          <Label>Link {linkIndex + 1}</Label>
                          <Input type="url" value={link.url} onChange={(e) => {
                            const steps = editResolution?.steps || [];
                            steps[index].links[linkIndex] = { ...steps[index].links[linkIndex], url: e.target.value };
                            setEditResolution(prev => prev ? { 
                              ...prev, 
                              steps 
                            } : null);
                          }} />
                        </div>
                      ))}
                    </div>
                    <ImageAttachment images={step.images || []} onImagesChange={(images: string[]) => {
                      const steps = editResolution?.steps || [];
                        steps[index] = { ...steps[index], images };
                        setEditResolution(prev => prev ? { 
                          ...prev, 
                          steps 
                        } : null);
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={editResolution?.isPrivate}
                  onCheckedChange={(isPrivate: boolean) => setEditResolution(prev => prev ? {
                    ...prev, 
                    isPrivate 
                  } : null)}
                />
                <Label>Private</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-black hover:bg-blue-900">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}