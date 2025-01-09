'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Copy, Plus, Trash2, Edit, Bookmark, Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getChatTemplates, deleteChatTemplate, updateChatTemplate, createChatTemplate, ChatTemplate } from '@/lib/firebase/chat-templates'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Logo } from '@/components/icons/Logo'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { predefinedTags } from '@/utils/predefined-tags'
import { Checkbox } from '@/components/ui/checkbox'
import { User } from 'firebase/auth'
import { getTagColor, tagColors } from '@/utils/tag-colors'

interface Template {
  id: string
  name: string
  contentMale: string
  contentFemale: string | null
  tags: string[]
  language: 'en' | 'he'
  isPrivate: boolean
}

export default function ChatTemplates() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<Template[]>([])
  const [newTemplate, setNewTemplate] = useState<Omit<Template, 'id'>>({
    name: '',
    contentMale: '',
    contentFemale: '',
    tags: [],
    isPrivate: true,
    language: 'en'
  })
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male')
  const [userName, setUserName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editTemplate, setEditTemplate] = useState<Template | null>(null)
  const [bookmarkedTemplates, setBookmarkedTemplates] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all')
  const { t } = useLanguage();
  const [hiddenTemplates, setHiddenTemplates] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!user) return;
      try {
        const fetchedTemplates = await getChatTemplates(user as unknown as User);
        setTemplates(fetchedTemplates as unknown as Template[]);
      } catch (error) {
        console.error('Error fetching templates:', error);
        if (error instanceof Error && 'code' in error && error.code === 'failed-precondition') {
          toast({
            title: "Index Required",
            description: t('Please create the necessary index in the Firebase Console.'),
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: t('Failed to load chat templates. Please try again later.'),
            variant: "destructive",
          });
        }
      }
    };

    fetchTemplates();
  }, [user]);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: t('Copied'),
      description: t('Template content has been copied to clipboard.'),
    })
  }

  const toggleBookmark = (templateId: string) => {
    setBookmarkedTemplates(prev => {
      const newBookmarks = new Set(prev)
      if (newBookmarks.has(templateId)) {
        newBookmarks.delete(templateId)
      } else {
        newBookmarks.add(templateId)
      }
      return newBookmarks
    })
  }

  const handleDelete = async (templateId: string) => {
    if (!user) return;
    try {
      await deleteChatTemplate(user as unknown as User, templateId)
      setTemplates(prev => prev.filter(template => template.id !== templateId))
      toast({
        title: t('Template Deleted'),
        description: t('The template has been deleted successfully.'),
      })
    } catch (error) {
      console.error('Error deleting template:', error)
      toast({
        title: "Error",
        description: t('Failed to delete template. Please try again later.'),
        variant: "destructive",
      })
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTemplate || !user) return

    try {
      await updateChatTemplate(user as unknown as User, editTemplate.id, editTemplate as unknown as Partial<Omit<ChatTemplate, "id" | "userId" | "createdAt">>)
      setTemplates(prev => prev.map(template => template.id === editTemplate.id ? editTemplate : template))
      toast({
        title: t('Template Updated'),
        description: t('The template has been updated successfully.'),
      })
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Error updating template:', error)
      toast({
        title: "Error",
        description: t('Failed to update template. Please try again later.'),
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return;
    setIsLoading(true)

    try {
      const newTemplateWithId = await createChatTemplate(user as unknown as User, newTemplate as unknown as Omit<ChatTemplate, "id" | "userId" | "createdAt" | "updatedAt">)
      setTemplates(prev => [...prev, newTemplateWithId as unknown as Template])
      setNewTemplate({ name: '', contentMale: '', contentFemale: null, tags: [], isPrivate: true, language: 'en' })
      toast({
        title: t('Template Created'),
        description: t('Your new chat template has been created successfully.'),
      })
    } catch (error) {
      console.error('Error creating template:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : t('Failed to create template. Please try again later.'),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsDialogOpen(false)
    }
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = selectedTagFilter === 'all' || template.tags.includes(selectedTagFilter)
    return matchesSearch && matchesTag
  })

  function replacePlaceholders(content: string, replacements: { [key: string]: string }): string {
    return content.replace(/{(\w+)}/g, (_, key) => replacements[key] || `{${key}}`);
  }

  const isOwner = (templateUserId: string) => user && user.uid === templateUserId;

  

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('Chat Templates')}</h1>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-black hover:bg-blue-900">
          <Plus className="h-4 w-4 mr-2" />
          {t('Create Template')}
        </Button>
      </div>
      <div className="flex flex-col space-y-2 md:flex-row md:space-x-4 md:items-end mt-4">
        <div className="flex-1">
          <Label htmlFor="name">{t('Name')}</Label>
          <Input
            id="name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder={t("Enter client's name")}
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="gender">{t('Gender')}</Label>
          <Select
            value={selectedGender}
            onValueChange={(value: 'male' | 'female') => setSelectedGender(value)}
          >
            <SelectTrigger id="gender">
              <SelectValue placeholder={t('Choose gender')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">{t('Male')}</SelectItem>
              <SelectItem value="female">{t('Female')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
          <div className="relative flex-grow">
            <Input
              placeholder={t('Search templates...')}
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
              {Object.keys(tagColors).map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chat Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-500">
            {t('No chat templates found matching your search criteria.')}
          </div>
        ) : (
          filteredTemplates.map((template, index) => (
            !hiddenTemplates.has(template.id) && (
              <div key={`${template.id}-${index}`} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className={`p-4 space-y-4 ${template.language === 'he' ? 'text-right' : 'text-left'}`}>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy((selectedGender === 'male' ? template.contentMale : template.contentFemale) ?? '')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          toggleBookmark(template.id);
                          await updateChatTemplate(user as unknown as User, template.id, { isPrivate: !template.isPrivate })
                        }}
                      >
                        <Bookmark className={`h-4 w-4 ${bookmarkedTemplates.has(template.id) ? 'fill-current text-yellow-500' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditTemplate(template)
                          setIsEditDialogOpen(true)
                        }}
                        disabled={!isOwner(template.userId)}
                        className={!isOwner(template.userId) ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                        disabled={!isOwner(template.userId)}
                        className={!isOwner(template.userId) ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {replacePlaceholders(
                      selectedGender === 'male' ? template.contentMale : template.contentFemale ?? '',
                      { name: userName }
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tagName) => {
                      const tag = predefinedTags.find(t => t.name === tagName);
                      return (
                        <span
                          key={tagName}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${tag?.color || 'bg-gray-200'}`}
                        >
                          {tagName}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('Create New Chat Template')}</DialogTitle>
            <DialogDescription>
              {t('Fill in the details for the new chat template.')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  {t('Name')}
                </Label>
                <Input
                  id="name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contentMale" className="text-right">
                  {t('Male Content')}
                </Label>
                <Textarea
                  id="contentMale"
                  value={newTemplate.contentMale ?? ''}
                  onChange={(e) => setNewTemplate({ ...newTemplate, contentMale: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contentFemale" className="text-right">
                  {t('Female Content')}
                </Label>
                <Textarea
                  id="contentFemale"
                  value={newTemplate.contentFemale ?? ''}
                  onChange={(e) => setNewTemplate({ ...newTemplate, contentFemale: e.target.value })}
                  className="col-span-3"
                />
              </div>  
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tags" className="text-right">
                  {t('Tags')}
                </Label>
                <Select
                  value={newTemplate.tags[0] || ''}
                  onValueChange={(value) => setNewTemplate({ ...newTemplate, tags: value ? [value] : [] })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t('Select a tag')} />
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedTags.map(tag => (
                      <SelectItem key={tag.name} value={tag.name} className={tag.color}>
                        {tag.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="language" className="text-right">
                  {t('Language')}
                </Label>
                <Select
                  value={newTemplate.language}
                  onValueChange={(value) => setNewTemplate({ ...newTemplate, language: value as 'en' | 'he' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('Select a language')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{t('English')}</SelectItem>
                    <SelectItem value="he">{t('Hebrew')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              </div>
            
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t('Creating...') : t('Create Template')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {editTemplate && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('Edit Template')}</DialogTitle>
              <DialogDescription>
                {t('Edit the template. Click save when you\'re done.')}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <form onSubmit={handleEdit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="editName" className="text-right">
                    {t('Name')}
                  </Label>
                  <Input
                    id="editName"
                    value={editTemplate.name}
                    onChange={(e) => setEditTemplate({ ...editTemplate, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="editContentMale" className="text-right">
                    {t('Male Content')}
                  </Label>
                  <Textarea
                    id="editContentMale"
                    value={editTemplate.contentMale ?? ''}
                    onChange={(e) => setEditTemplate({ ...editTemplate, contentMale: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="editContentFemale" className="text-right">
                    {t('Female Content')}
                  </Label>
                  <Textarea
                    id="editContentFemale"
                    value={editTemplate.contentFemale ?? ''}
                    onChange={(e) => setEditTemplate({ ...editTemplate, contentFemale: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="editTags" className="text-right">
                    {t('Tags')}
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={editTemplate.tags[0] || ''}
                      onValueChange={(value) => setEditTemplate({ ...editTemplate, tags: value ? [value] : [] })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('Select a tag')} />
                      </SelectTrigger>
                      <SelectContent>
                        {predefinedTags.map(tag => (
                          <SelectItem key={tag.name} value={tag.name}>
                            {tag.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="editLanguage" className="text-right">
                    {t('Language')}
                  </Label>
                  <Select
                    value={editTemplate.language}
                    onValueChange={(value) => setEditTemplate({ ...editTemplate, language: value as 'en' | 'he' })}
                    
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select a language')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">{t('English')}</SelectItem>
                      <SelectItem value="he">{t('Hebrew')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="editPrivate"
                    checked={editTemplate.isPrivate}
                    onCheckedChange={(checked: boolean) => setEditTemplate({ ...editTemplate, isPrivate: checked })}
                  />
                  <Label htmlFor="editPrivate">{t('Private template')}</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {t('Save Changes')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

