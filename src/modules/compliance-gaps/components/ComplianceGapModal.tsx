import React from 'react';
import { X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ComplianceGapForm } from './ComplianceGapForm';

interface ComplianceGapModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatHistoryId: string;
  auditSessionId?: string;
  complianceDomain?: string;
  initialMessage?: string;
  sources?: string[];
}

export const ComplianceGapModal: React.FC<ComplianceGapModalProps> = ({
  isOpen,
  onClose,
  chatHistoryId,
  auditSessionId,
  complianceDomain,
  initialMessage,
  sources
}) => {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [createdGapId, setCreatedGapId] = React.useState<string | null>(null);

  const handleSuccess = (gapId: string) => {
    setCreatedGapId(gapId);
    setShowSuccess(true);
  };

  const handleClose = () => {
    setShowSuccess(false);
    setCreatedGapId(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>

          {showSuccess ? (
            // Success state
            <div className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Compliance Gap Created Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Your compliance gap has been created and assigned ID: 
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded ml-2">
                  {createdGapId}
                </span>
              </p>
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  The compliance gap will be reviewed by the compliance team and appropriate actions will be taken.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={handleClose}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Close
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // TODO: Navigate to compliance gaps view
                      console.log('Navigate to compliance gaps');
                      handleClose();
                    }}
                  >
                    View All Gaps
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Form state
            <div className="p-6">
              <ComplianceGapForm
                chatHistoryId={chatHistoryId}
                auditSessionId={auditSessionId}
                complianceDomain={complianceDomain}
                initialMessage={initialMessage}
                sources={sources}
                onSuccess={handleSuccess}
                onCancel={handleClose}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};