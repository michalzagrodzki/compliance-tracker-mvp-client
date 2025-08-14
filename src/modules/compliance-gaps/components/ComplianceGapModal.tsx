/* eslint-disable no-useless-catch */
import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ComplianceGapFromChatHistoryRequest } from '../types';
import { ComplianceGapForm } from './ComplianceGapForm';

interface ComplianceGapModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatHistoryId: string;
  auditSessionId?: string;
  complianceDomain?: string;
  initialMessage?: string;
  sources?: string[];
  onSubmitRequest: (request: ComplianceGapFromChatHistoryRequest) => Promise<void>;
}

export const ComplianceGapModal: React.FC<ComplianceGapModalProps> = ({
  isOpen,
  onClose,
  onSubmitRequest,
  chatHistoryId,
  auditSessionId,
  complianceDomain,
  initialMessage,
  sources
}) => {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [createdGapId, setCreatedGapId] = React.useState<string | null>(null);

  const handleSubmitWithSuccess = async (request: ComplianceGapFromChatHistoryRequest) => {
    try {
      await onSubmitRequest(request);
      setCreatedGapId(`GAP-${Date.now()}`);
      setShowSuccess(true);
    } catch (error) {
      throw error;
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    setCreatedGapId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[1300px] w-full max-h-[90vh] flex flex-col">
        {showSuccess ? (
          // Success state
          <>
            <DialogHeader>
              <div className="flex flex-col items-center text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Compliance Gap Created Successfully!
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Your compliance gap has been created and assigned ID: 
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded ml-2">
                    {createdGapId}
                  </span>
                </DialogDescription>
              </div>
            </DialogHeader>
            
            <div className="flex-1 flex items-center justify-center py-8">
              <p className="text-sm text-gray-500 text-center">
                The compliance gap will be reviewed by the compliance team and appropriate actions will be taken.
              </p>
            </div>

            <DialogFooter className="flex justify-center space-x-4">
              <DialogClose asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  Close
                </Button>
              </DialogClose>
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
            </DialogFooter>
          </>
        ) : (
          // Form state
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span>Create Compliance Gap</span>
              </DialogTitle>
              <DialogDescription>
                Identify and document a potential compliance gap based on the chat interaction.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto">
              <ComplianceGapForm
                chatHistoryId={chatHistoryId}
                auditSessionId={auditSessionId}
                complianceDomain={complianceDomain}
                initialMessage={initialMessage}
                sources={sources}
                onSubmitRequest={handleSubmitWithSuccess}
                onCancel={handleClose}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};