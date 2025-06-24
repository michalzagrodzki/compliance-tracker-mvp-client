import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useIngestionStore } from '../store/documentStore'
import { Upload, AlertCircle, CheckCircle, X, FileText } from 'lucide-react'

export default function DocumentUploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [complianceDomain, setComplianceDomain] = useState('')
  const [documentVersion, setDocumentVersion] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [formError, setFormError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(false)
  
  const {
    uploadDocument,
    fetchComplianceDomains,
    fetchTagConstants,
    complianceDomains,
    tagConstants,
    isLoading,
    error,
    uploadProgress
  } = useIngestionStore()
  
  const navigate = useNavigate()

  useEffect(() => {
    fetchComplianceDomains()
    fetchTagConstants()
  }, [fetchComplianceDomains, fetchTagConstants])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setFormError('Only PDF files are supported')
        return
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setFormError('File size must be less than 50MB')
        return
      }
      setSelectedFile(file)
      setFormError('')
    }
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setUploadSuccess(false)

    if (!selectedFile) {
      setFormError('Please select a PDF file')
      return
    }

    try {
      const uploadData = {
        file: selectedFile,
        compliance_domain: complianceDomain || undefined,
        document_version: documentVersion || undefined,
        document_tags: selectedTags.length > 0 ? selectedTags : undefined,
      }

      await uploadDocument(uploadData)
      setUploadSuccess(true)
      
      setSelectedFile(null)
      setComplianceDomain('')
      setDocumentVersion('')
      setSelectedTags([])
      
      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }

      setTimeout(() => {
        navigate('/documents')
      }, 3000)
      
    } catch (err) {
      console.error('Upload failed:', err)
    }
  }

  const renderTagSection = (categoryName: string, tagsData: string[]) => {
    let tags: string[] = [];
    
    if (Array.isArray(tagsData)) {
      tags = tagsData;
    } else if (tagsData && typeof tagsData === 'object') {
      tags = Object.keys(tagsData);
    }
    
    if (!tags.length) return null;

    return (
      <div key={categoryName} className="space-y-2">
        <h4 className="font-medium text-sm text-muted-foreground capitalize">
          {categoryName.replace('_', ' ')}
        </h4>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagToggle(tag)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-muted border-border'
              }`}
              title={typeof tagsData === 'object' && !Array.isArray(tagsData) ? tagsData[tag] : undefined}
            >
              {tag.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Upload Document</h1>
        <p className="text-muted-foreground">
          Upload a PDF document to the knowledge base for compliance review
        </p>
      </div>

      {uploadSuccess && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center space-x-2 pt-6">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-green-700">
              Document uploaded successfully! Redirecting to documents list...
            </span>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Document Upload</span>
          </CardTitle>
          <CardDescription>
            Select a PDF file and provide metadata for compliance tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {(formError || error) && (
              <div className="flex items-center space-x-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>{formError || error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="file-upload" className="text-sm font-medium">
                PDF File *
              </label>
              <div className="flex items-center space-x-4">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  required
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                />
                {selectedFile && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{selectedFile.name}</span>
                    <span>({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum file size: 50MB. Only PDF files are supported.
              </p>
            </div>

            {isLoading && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="compliance-domain" className="text-sm font-medium">
                Compliance Domain
              </label>
              <select
                id="compliance-domain"
                value={complianceDomain}
                onChange={(e) => setComplianceDomain(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                disabled={isLoading}
              >
                <option value="">Select compliance domain (optional)</option>
                {complianceDomains.map((domain) => (
                  <option key={domain.code} value={domain.code}>
                    {domain.code} - {domain.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="document-version" className="text-sm font-medium">
                Document Version
              </label>
              <Input
                id="document-version"
                type="text"
                placeholder="e.g., v1.0, 2024-Q1"
                value={documentVersion}
                onChange={(e) => setDocumentVersion(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Optional version identifier for tracking document revisions
              </p>
            </div>

            {tagConstants && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Document Tags</label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select relevant tags to categorize this document
                  </p>
                </div>

                {selectedTags.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Selected Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map(tag => (
                        <span
                          key={tag}
                          className="flex items-center space-x-1 px-3 py-1 text-xs rounded-full bg-primary text-primary-foreground"
                        >
                          <span>{tag.replace('_', ' ')}</span>
                          <button
                            type="button"
                            onClick={() => handleTagToggle(tag)}
                            className="hover:bg-primary/80 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(tagConstants.tag_categories).map(([category, tags]) =>
                    renderTagSection(category, tags as string[])
                  )}
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading || !selectedFile || uploadSuccess}
              >
                {isLoading ? 'Uploading...' : 'Upload Document'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/documents')}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-3 text-sm">
            <h4 className="font-medium">Upload Tips</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Documents are automatically split into searchable chunks</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Tags help categorize documents for better discovery</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Compliance domains enable domain-specific searches</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}