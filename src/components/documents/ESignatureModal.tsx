import React, { useRef, useState } from 'react';
import { X, Eraser } from 'lucide-react';
import { Button } from '../ui/Button';
import SignatureCanvas from 'react-signature-canvas';
import { signDocument } from '../../services/api';
import toast from 'react-hot-toast';

interface ESignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentName: string;
  onSuccess: () => void;
}

export const ESignatureModal: React.FC<ESignatureModalProps> = ({ 
  isOpen, 
  onClose, 
  documentId,
  documentName,
  onSuccess
}) => {
  const sigPadRef = useRef<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleClear = () => {
    sigPadRef.current?.clear();
  };

  const handleSave = async () => {
    if (sigPadRef.current?.isEmpty()) {
      toast.error('Please provide a signature before saving.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Get base64 string
      const dataUrl = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png');
      
      await signDocument(documentId, dataUrl);
      toast.success('Document successfully signed!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to apply signature.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg animate-fade-in relative overflow-hidden">
        
        {/* Blue top border flair */}
        <div className="h-1.5 w-full bg-primary-600"></div>

        <div className="flex justify-between items-start px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Sign Document</h2>
            <p className="text-sm text-gray-500 mt-1 truncate max-w-[300px]">Signing: {documentName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 bg-gray-50 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Draw your signature below
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 relative">
              <SignatureCanvas 
                ref={sigPadRef}
                canvasProps={{
                  className: 'w-full h-48 rounded-lg cursor-crosshair'
                }}
                minWidth={1.5}
                maxWidth={3}
                penColor="#000000"
              />
              <button 
                onClick={handleClear}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500 flex items-center gap-1 text-xs font-medium bg-white px-2 py-1 border shadow-sm rounded-md transition-colors"
              >
                <Eraser size={14} /> Clear
              </button>
              
              <div className="absolute bottom-2 left-6 text-gray-400 pointer-events-none select-none text-4xl font-serif opacity-20">
                X
              </div>
              <div className="absolute bottom-2 border-b border-gray-300 w-[calc(100%-3rem)] left-6 pointer-events-none"></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">By saving, you agree that this digital signature acts as a legally binding affirmation.</p>
          </div>

          <div className="mt-8 flex gap-3 justify-end items-center">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} isLoading={isSubmitting}>
              Apply E-Signature
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
