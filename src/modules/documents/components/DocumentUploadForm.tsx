import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useIngestion } from '../hooks/useIngestion'
import { generateDocumentVersion } from '@/lib/documents'
import ErrorDisplay from './shared/ErrorDisplay'
import UploadProgressBar from './shared/UploadProgressBar'
import TagSelector from './shared/TagSelector'
import MetadataExtractorCard from './shared/MetadataExtractorCard'
import { 
  Upload, 
  CheckCircle, 
  FileText, 
  Info, 
  ChevronUp, 
  ChevronDown
} from 'lucide-react'

export default function DocumentUploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [complianceDomain, setComplianceDomain] = useState('')
  const [documentVersion, setDocumentVersion] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [documentTitle, setDocumentTitle] = useState('')
  const [documentAuthor, setDocumentAuthor] = useState('')
  const [titleOverride, setTitleOverride] = useState(false)
  const [authorOverride, setAuthorOverride] = useState(false)
  const [formError, setFormError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [showIngestionInfo, setShowIngestionInfo] = useState(false)
  const [showMetadataDetails, setShowMetadataDetails] = useState(false)
  
  const {
    uploadDocument,
    fetchComplianceDomains,
    fetchTagConstants,
    extractPdfMetadata,
    clearExtractedMetadata,
    complianceDomains,
    tagConstants,
    isLoading,
    error,
    uploadProgress,
    extractedMetadata,
    isExtractingMetadata
  } = useIngestion()
  
  const navigate = useNavigate()

  useEffect(() => {
    fetchComplianceDomains()
    fetchTagConstants()
  }, [fetchComplianceDomains, fetchTagConstants])

  useEffect(() => {
    // Update title and author when metadata is extracted
    if (extractedMetadata && !titleOverride && !authorOverride) {
      if (extractedMetadata.title) {
        setDocumentTitle(extractedMetadata.title)
      }
      if (extractedMetadata.author) {
        setDocumentAuthor(extractedMetadata.author)
      }
    }
  }, [extractedMetadata, titleOverride, authorOverride])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      // Clear previous metadata and reset overrides
      clearExtractedMetadata()
      setTitleOverride(false)
      setAuthorOverride(false)
      setDocumentTitle('')
      setDocumentAuthor('')
      
      // Extract metadata from the PDF
      try {
        await extractPdfMetadata(file)
      } catch (error) {
        console.warn('Failed to extract metadata:', error)
        // Fallback title from filename
        const fallbackTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ")
        setDocumentTitle(fallbackTitle)
      }
    }
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleTitleChange = (value: string) => {
    setDocumentTitle(value)
    setTitleOverride(true)
  }

  const handleAuthorChange = (value: string) => {
    setDocumentAuthor(value)
    setAuthorOverride(true)
  }

  const resetToExtractedTitle = () => {
    if (extractedMetadata?.title) {
      setDocumentTitle(extractedMetadata.title)
      setTitleOverride(false)
    }
  }

  const resetToExtractedAuthor = () => {
    if (extractedMetadata?.author) {
      setDocumentAuthor(extractedMetadata.author)
      setAuthorOverride(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setUploadSuccess(false)

    if (!selectedFile) {
      setFormError('Please select a PDF file')
      return
    }

    if (!documentTitle.trim()) {
      setFormError('Document title is required')
      return
    }

    try {
      const uploadData = {
        file: selectedFile,
        compliance_domain: complianceDomain || undefined,
        document_version: documentVersion || undefined,
        document_tags: selectedTags.length > 0 ? selectedTags : undefined,
        document_title: documentTitle.trim(),
        document_author: documentAuthor.trim() || undefined,
      }

      await uploadDocument(uploadData)
      setUploadSuccess(true)
      
      // Reset form
      setSelectedFile(null)
      setComplianceDomain('')
      setDocumentVersion('')
      setSelectedTags([])
      setDocumentTitle('')
      setDocumentAuthor('')
      setTitleOverride(false)
      setAuthorOverride(false)
      clearExtractedMetadata()
      
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Upload Document for Ingestion</h1>
        <p className="text-muted-foreground">
          Upload a PDF document to be processed and indexed into the knowledge base
        </p>
      </div>

      {uploadSuccess && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center space-x-2 pt-6">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-green-700">
              Document uploaded successfully! The ingestion process has started. Redirecting to documents list...
            </span>
          </CardContent>
        </Card>
      )}

      <Card className="border-blue-200 bg-blue-50 p-2">
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <h6 className="font-medium text-blue-800">About Document Upload</h6>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowIngestionInfo(!showIngestionInfo)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
            >
              {showIngestionInfo ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show More
                </>
              )}
            </Button>
          </div>
          
          {showIngestionInfo && (
            <div className="mt-4 pl-8 space-y-2">
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Documents are automatically split into searchable text chunks</p>
                <p>• Text is vectorized and stored for semantic search capabilities</p>
                <p>• Processing typically takes 1-5 minutes depending on document size</p>
                <p>• You can monitor the ingestion progress in the documents list</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Document Ingestion</span>
          </CardTitle>
          <CardDescription>
            Select a PDF file and provide metadata for compliance tracking and organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {(formError || error) && <ErrorDisplay error={formError || error || ''} />}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="file-upload" className="text-sm font-medium">
                    PDF File *
                  </label>
                  <div className="space-y-4">
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
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground p-2 bg-muted rounded">
                        <FileText className="h-4 w-4" />
                        <span>{selectedFile.name}</span>
                        <span>({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Maximum file size: 50MB. Only PDF files are supported for ingestion.
                  </p>
                </div>

                <MetadataExtractorCard
                  selectedFile={selectedFile}
                  extractedMetadata={extractedMetadata}
                  isExtractingMetadata={isExtractingMetadata}
                  documentTitle={documentTitle}
                  documentAuthor={documentAuthor}
                  titleOverride={titleOverride}
                  authorOverride={authorOverride}
                  showMetadataDetails={showMetadataDetails}
                  isLoading={isLoading}
                  onTitleChange={handleTitleChange}
                  onAuthorChange={handleAuthorChange}
                  onResetToExtractedTitle={resetToExtractedTitle}
                  onResetToExtractedAuthor={resetToExtractedAuthor}
                  onToggleMetadataDetails={() => setShowMetadataDetails(!showMetadataDetails)}
                />

                <UploadProgressBar 
                  progress={uploadProgress}
                  isVisible={isLoading && uploadProgress > 0}
                />

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
                  <p className="text-xs text-muted-foreground">
                    Assign a compliance domain to enable domain-specific searches and auditing
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="document-version" className="text-sm font-medium">
                    Document Version
                  </label>
                  <Input
                    id="document-version"
                    type="text"
                    placeholder="e.g., v1.0, 2024-Q1, rev-3"
                    value={documentVersion}
                    onChange={(e) => setDocumentVersion(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional version identifier for tracking document revisions and updates
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDocumentVersion(generateDocumentVersion())}
                      disabled={isLoading}
                    >
                      Generate Version
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Auto-generate version based on current quarter
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {tagConstants && (
                  <TagSelector
                    tagConstants={tagConstants}
                    selectedTags={selectedTags}
                    onTagToggle={handleTagToggle}
                  />
                )}
              </div>
            </div>

            <div className="flex justify-center space-x-3 pt-6 border-t">
              <Button
                type="submit"
                className="px-8"
                disabled={isLoading || !selectedFile || uploadSuccess || !documentTitle.trim()}
              >
                {isLoading ? 'Processing...' : 'Start Uploading Document'}
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
        <CardContent>
          <div className="space-y-3 text-sm">
            <h4 className="font-medium">Ingestion Process Tips</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Document title and author are automatically extracted from PDF metadata when available</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Documents are automatically chunked into searchable segments for optimal retrieval</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Tags help categorize documents and improve search accuracy across the knowledge base</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Compliance domains enable domain-specific searches and audit trails</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Processing status can be monitored in real-time from the documents list</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}