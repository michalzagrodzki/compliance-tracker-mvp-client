import { AlertCircle, AlertTriangle, CheckCircle, Eye, Shield, X } from 'lucide-react';

/**
 * Status icon mapping for compliance gaps and other status indicators
 */
export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'identified': 
      return <AlertTriangle className="h-4 w-4" />;
    case 'acknowledged': 
      return <Eye className="h-4 w-4" />;
    case 'in_progress': 
      return <CheckCircle className="h-4 w-4" />;
    case 'resolved': 
      return <CheckCircle className="h-4 w-4" />;
    case 'false_positive': 
      return <X className="h-4 w-4" />;
    case 'accepted_risk': 
      return <Shield className="h-4 w-4" />;
    default: 
      return <AlertCircle className="h-4 w-4" />;
  }
};