interface UploadProgressBarProps {
  progress: number
  isVisible: boolean
  className?: string
}

export default function UploadProgressBar({ 
  progress, 
  isVisible, 
  className = '' 
}: UploadProgressBarProps) {
  if (!isVisible) return null

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <span>Uploading and processing...</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        The document is being uploaded and will be processed automatically.
      </p>
    </div>
  )
}