import { memo } from 'react'
import { Shield } from 'lucide-react'

const Loading = memo(() => (
  <div className="flex space-x-2 p-4">
    <Shield className="h-6 w-6 text-gray-400 animate-bounce [animation-delay:-.3s]" />
    <Shield className="h-6 w-6 text-gray-400 animate-bounce [animation-delay:-.15s]" />
    <Shield className="h-6 w-6 text-gray-400 animate-bounce" />
  </div>
))

Loading.displayName = 'Loading'

export default Loading