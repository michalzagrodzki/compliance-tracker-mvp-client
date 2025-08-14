export const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  } else {
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  }
}

export const getRiskLevelColor = (level: string) => {
  switch (level) {
    case 'low': return 'text-green-600 bg-green-50 border-green-200'
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'critical': return 'text-red-600 bg-red-50 border-red-200'
    default: return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export const getBusinessImpactColor = (level: string) => {
  switch (level) {
    case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'medium': return 'text-indigo-600 bg-indigo-50 border-indigo-200'
    case 'high': return 'text-purple-600 bg-purple-50 border-purple-200'
    case 'critical': return 'text-pink-600 bg-pink-50 border-pink-200'
    default: return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'identified': return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'acknowledged': return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'in_progress': return 'text-purple-600 bg-purple-50 border-purple-200'
    case 'resolved': return 'text-green-600 bg-green-50 border-green-200'
    case 'false_positive': return 'text-gray-600 bg-gray-50 border-gray-200'
    case 'accepted_risk': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    default: return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const hasRecommendation = (recommendationText: string | null) => {
  return recommendationText && recommendationText.trim() !== '';
}