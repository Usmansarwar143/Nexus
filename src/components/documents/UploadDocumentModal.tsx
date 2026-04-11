import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '../ui/Button';
import { createDocument } from '../../services/api';
import toast from 'react-hot-toast';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isShared, setIsShared] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('shared', isShared ? 'true' : 'false');
      
      await createDocument(formData);
      toast.success('Document uploaded successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fade-in">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Upload Document</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              {file ? (
                <p className="text-sm font-medium text-primary-600">{file.name}</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-900">Click or drag file to upload</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC up to 10MB</p>
                </>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="shared"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
              />
              <label htmlFor="shared" className="ml-2 block text-sm text-gray-900">
                Sharable with contacts (make public to connected investors)
              </label>
            </div>

          </div>
          
          <div className="mt-6 flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isUploading} disabled={!file}>
              Upload
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
