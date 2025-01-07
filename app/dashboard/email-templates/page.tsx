'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Copy, Plus, Trash2, Edit, Bookmark, Search } from 'lucide-react'
import { Checkbox } from "@/components/ui/checkbox"
import { getTagColor, tagColors } from '@/utils/tag-colors'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Logo } from '@/components/icons/Logo'
import { 
  createEmailTemplate, 
  getEmailTemplates, 
  updateEmailTemplate, 
  deleteEmailTemplate 
} from '@/lib/firebase/email-templates'
import { User as FirebaseUser } from 'firebase/auth'


interface EmailTemplate {
  id: string
  name: string
  subject: string
  contentMale: string
  contentFemale: string
  tags: string[]
  isPrivate: boolean
  language: 'en' | 'he'
  textAlign: 'left' | 'right'
}

export default function EmailTemplates() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [newTemplate, setNewTemplate] = useState<Omit<EmailTemplate, 'id'>>({
    name: '',
    subject: '',
    contentMale: '',
    contentFemale: '',
    tags: [],
    isPrivate: true,
    language: 'en',
    textAlign: 'left'
  })
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male')
  const [userName, setUserName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editTemplate, setEditTemplate] = useState<EmailTemplate | null>(null)
  const [bookmarkedTemplates, setBookmarkedTemplates] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all')
  const { t } = useLanguage()


  useEffect(() => {
    const fetchTemplates = async () => {
      if (!user) return;
      try {
        setIsLoading(true)
        const fetchedTemplates = await getEmailTemplates(user as unknown as FirebaseUser)
        setTemplates(fetchedTemplates as unknown as EmailTemplate[])
      } catch (error) {
        console.error('Error fetching templates:', error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : t('Failed to load email templates. Please try again later.'),
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplates()
  }, [user])

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
      await deleteEmailTemplate(user as unknown as FirebaseUser, templateId)
      setTemplates(prev => prev.filter(template => template.id !== templateId))
      toast({
        title: t('Template Deleted'),
        description: t('The email template has been deleted successfully.'),
      })
    } catch (error) {
      console.error('Error deleting template:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : t('Failed to delete template. Please try again later.'),
        variant: "destructive",
      })
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTemplate || !user) return

    try {
      await updateEmailTemplate(user as unknown as FirebaseUser, editTemplate.id, editTemplate)
      setTemplates(prev => prev.map(template => template.id === editTemplate.id ? editTemplate : template))
      toast({
        title: t('Template Updated'),
        description: t('The email template has been updated successfully.'),
      })
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Error updating template:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : t('Failed to update template. Please try again later.'),
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return;
    setIsLoading(true)

    try {
      const newTemplateWithId = await createEmailTemplate(user as unknown as FirebaseUser, newTemplate)
      setTemplates(prev => [...prev, newTemplateWithId] as EmailTemplate[])
      setNewTemplate({ name: '', subject: '', contentMale: '', contentFemale: '', tags: [], isPrivate: true, language: 'en', textAlign: 'left' })
      toast({
        title: t('Template Created'),
        description: t('Your new email template has been created successfully.')
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

  const filteredTemplates = templates ? templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = selectedTagFilter === 'all' || template.tags.includes(selectedTagFilter)
    return matchesSearch && matchesTag
  }) : []

  function replacePlaceholders(template: string, placeholders: { [key: string]: string }): string {
    return template.replace(/{(\w+)}/g, (_, key) => placeholders[key] || '');
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t('Email Templates')}</h1>
        </div>
        <div>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            {t('Create Template')}
          </Button>
        </div>
      </div>

      <div className="flex flex-col space-y-2 md:flex-row md:space-x-4 md:items-end mt-4">
        <div className="flex-1">
          <Label htmlFor="userName">{t('Client Name')}</Label>
          <Input
            id="userName"
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
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-500">
            {t('No templates found matching your search criteria.')}
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <div key={template.id} className="p-4 bg-white rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{template.name}</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(selectedGender === 'male' ? template.contentMale : template.contentFemale)}
                    className="h-8 w-8"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleBookmark(template.id)}
                    className="h-8 w-8"
                  >
                    <Bookmark className={`h-4 w-4 ${bookmarkedTemplates.has(template.id) ? 'fill-current text-yellow-500' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditTemplate(template)
                      setIsEditDialogOpen(true)
                    }}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(template.id)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{t('Subject')}: {template.subject}</p>
              <p className={`mb-4 whitespace-pre-wrap text-${template.language === 'he' ? 'right' : 'left'}`}>
                {replacePlaceholders(
                  selectedGender === 'male' ? template.contentMale : template.contentFemale,
                  { name: userName }
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getTagColor(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
                {template.isPrivate && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {t('Private')}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('Create New Email Template')}</DialogTitle>
            <DialogDescription>
              {t('Fill in the details for the new email template.')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
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
                <Label htmlFor="subject" className="text-right">
                  {t('Subject')}
                </Label>
                <Input
                  id="subject"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contentMale" className="text-right">
                  {t('Male Version')}
                </Label>
                <Textarea
                  id="contentMale"
                  value={newTemplate.contentMale}
                  onChange={(e) => setNewTemplate({ ...newTemplate, contentMale: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contentFemale" className="text-right">
                  {t('Female Version')}
                </Label>
                <Textarea
                  id="contentFemale"
                  value={newTemplate.contentFemale}
                  onChange={(e) => setNewTemplate({ ...newTemplate, contentFemale: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="language" className="text-right">
                  {t('Language')}
                </Label>
                <Select
                  value={newTemplate.language}
                  onValueChange={(value: 'en' | 'he') => setNewTemplate({ 
                    ...newTemplate, 
                    language: value, 
                    textAlign: value === 'he' ? 'right' : 'left' 
                  })}
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
                    {Object.keys(tagColors).map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="private"
                  checked={newTemplate.isPrivate}
                  onCheckedChange={(checked: boolean) => setNewTemplate({ ...newTemplate, isPrivate: checked })}
                />
                <Label htmlFor="private">{t('Private template')}</Label>
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
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('Edit Email Template')}</DialogTitle>
              <DialogDescription>
                {t('Edit the email template. Click save when you\'re done.')}
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
                  <Label htmlFor="editSubject" className="text-right">
                    {t('Subject')}
                  </Label>
                  <Input
                    id="editSubject"
                    value={editTemplate.subject}
                    onChange={(e) => setEditTemplate({ ...editTemplate, subject: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="editContentMale" className="text-right">
                    {t('Male Content')}
                  </Label>
                  <Textarea
                    id="editContentMale"
                    value={editTemplate.contentMale}
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
                    value={editTemplate.contentFemale}
                    onChange={(e) => setEditTemplate({ ...editTemplate, contentFemale: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="editLanguage" className="text-right">
                    {t('Language')}
                  </Label>
                  <Select
                    value={editTemplate.language}
                    onValueChange={(value: 'en' | 'he') => setEditTemplate({ ...editTemplate, language: value })}
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="editTags" className="text-right">
                    {t('Tags')}
                  </Label>
                  <Select
                    value={editTemplate.tags[0] || ''}
                    onValueChange={(value) => setEditTemplate({ ...editTemplate, tags: value ? [value] : [] })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder={t('Select a tag')} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(tagColors).map(tag => (
                        <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                      ))}
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
                <Button type="submit">{t('Save Changes')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

