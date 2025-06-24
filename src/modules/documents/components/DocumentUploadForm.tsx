/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useIngestionStore } from '../store/documentStore'
import { 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  X, 
  FileText, 
  Info, 
  ChevronUp, 
  ChevronDown,
  Sparkles,
  User,
  FileEdit,
  Eye,
  EyeOff
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
  } = useIngestionStore()
  
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

  const generateDocumentVersion = () => {
    const date = new Date()
    const year = date.getFullYear()
    const quarter = Math.ceil((date.getMonth() + 1) / 3)
    return `${year}-Q${quarter}`
  }

  const renderTagSection = (categoryName: string, tagsData: any) => {
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
              className={`px-3 py-2 text-xs rounded-lg border transition-colors text-left min-w-[120px] ${
                selectedTags.includes(tag)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-muted border-border'
              }`}
            >
              <div className="flex flex-col space-y-0.5">
                <span className="font-medium leading-tight">
                  {tag.replace('_', ' ')}
                </span>
                {typeof tagsData === 'object' && !Array.isArray(tagsData) && tagsData[tag] && (
                  <span className="text-xs opacity-75 leading-tight">
                    {tagsData[tag]}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    )
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
              Document uploaded successfully! The ingestion process has started. Redirecting to ingestions list...
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
                <p>• You can monitor the ingestion progress in the ingestions list</p>
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
            {(formError || error) && (
              <div className="flex items-center space-x-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>{formError || error}</span>
              </div>
            )}

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
                {selectedFile && (
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                          <CardTitle className="text-lg">Document Metadata</CardTitle>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowMetadataDetails(!showMetadataDetails)}
                        >
                          {showMetadataDetails ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {showMetadataDetails && (
                        <CardDescription>
                          {isExtractingMetadata ? (
                            <span className="flex items-center space-x-2">
                              <div className="animate-spin h-3 w-3 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                              <span>Extracting metadata from PDF...</span>
                            </span>
                          ) : extractedMetadata ? (
                            extractedMetadata.hasMetadata ? (
                              <span className="text-green-600">✓ Metadata extracted successfully from PDF</span>
                            ) : (
                              <span className="text-amber-600">⚠ No metadata found in PDF, using filename as title</span>
                            )
                          ) : null}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label htmlFor="document-title" className="text-sm font-medium flex items-center space-x-2">
                            <FileEdit className="h-4 w-4" />
                            <span>Document Title *</span>
                          </label>
                          {extractedMetadata?.title && titleOverride && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={resetToExtractedTitle}
                              className="text-xs"
                            >
                              Reset to extracted
                            </Button>
                          )}
                        </div>
                        <Input
                          id="document-title"
                          type="text"
                          placeholder="Enter document title"
                          value={documentTitle}
                          onChange={(e) => handleTitleChange(e.target.value)}
                          disabled={isLoading}
                          required
                          className={titleOverride ? "border-amber-300 bg-amber-50" : ""}
                        />
                        {extractedMetadata?.title && (
                          <p className="text-xs text-muted-foreground">
                            {titleOverride ? (
                              <span className="text-amber-600">Modified from extracted: "{extractedMetadata.title}"</span>
                            ) : (
                              <span className="text-green-600">Extracted from PDF metadata</span>
                            )}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label htmlFor="document-author" className="text-sm font-medium flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>Document Author</span>
                          </label>
                          {extractedMetadata?.author && authorOverride && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={resetToExtractedAuthor}
                              className="text-xs"
                            >
                              Reset to extracted
                            </Button>
                          )}
                        </div>
                        <Input
                          id="document-author"
                          type="text"
                          placeholder="Enter document author (optional)"
                          value={documentAuthor}
                          onChange={(e) => handleAuthorChange(e.target.value)}
                          disabled={isLoading}
                          className={authorOverride ? "border-amber-300 bg-amber-50" : ""}
                        />
                        {extractedMetadata?.author && (
                          <p className="text-xs text-muted-foreground">
                            {authorOverride ? (
                              <span className="text-amber-600">Modified from extracted: "{extractedMetadata.author}"</span>
                            ) : (
                              <span className="text-green-600">Extracted from PDF metadata</span>
                            )}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {isLoading && uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading and processing...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      The document is being uploaded and will be processed automatically.
                    </p>
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
                  <>
                    <div>
                      <label className="text-sm font-medium">Document Tags</label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Select relevant tags to categorize this document for better discovery and organization
                      </p>
                    </div>

                    {selectedTags.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Selected Tags:</h4>
                        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded border">
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

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {Object.entries(tagConstants.tag_categories).map(([category, tagsData]) =>
                        renderTagSection(category, tagsData)
                      )}
                    </div>
                  </>
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
                onClick={() => navigate('/ingestions')}
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
                <span>Processing status can be monitored in real-time from the ingestions list</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}