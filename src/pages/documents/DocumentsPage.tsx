import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download, Trash2, Share2, Eye, PenTool, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { getDocuments, deleteDocument } from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

import { UploadDocumentModal } from '../../components/documents/UploadDocumentModal';
import { DocumentPreviewModal } from '../../components/documents/DocumentPreviewModal';
import { ESignatureModal } from '../../components/documents/ESignatureModal';

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);

  const [signDoc, setSignDoc] = useState<any>(null);
  const [isSignModalOpen, setSignModalOpen] = useState(false);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const res = await getDocuments();
      setDocuments(res.data);
    } catch (err) {
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteDocument(id);
        toast.success("Document deleted");
        fetchDocuments();
      } catch (err) {
        toast.error("Failed to delete document");
      }
    }
  };

  const handlePreview = (doc: any) => {
    if (!doc.url) {
      toast.error("File is not previewable.");
      return;
    }
    setPreviewDoc(doc);
    setPreviewModalOpen(true);
  };

  const handleSign = (doc: any) => {
    setSignDoc(doc);
    setSignModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Chamber</h1>
          <p className="text-gray-600">Securely store, preview, and digitally sign your files.</p>
        </div>
        
        <Button onClick={() => setUploadModalOpen(true)} leftIcon={<Upload size={18} />}>
          Upload Document
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Storage info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Cloud Storage</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used</span>
                <span className="font-medium text-gray-900">
                  {documents.length > 0 
                     ? (documents.reduce((acc, curr) => acc + (parseFloat(curr.size) || 0), 0)).toFixed(2) + ' MB'
                     : '0 MB'}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-primary-600 rounded-full" style={{ width: '15%' }}></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Available</span>
                <span className="font-medium text-gray-900">5.0 GB</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Filters</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm font-medium bg-primary-50 text-primary-700 rounded-md">
                  All Documents
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Awaiting Signature
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Signed
                </button>
              </div>
            </div>
          </CardBody>
        </Card>
        
        {/* Document list */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Files</h2>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <div className="flex justify-center items-center h-48 text-gray-500">Loading documents...</div>
              ) : documents.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-48 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <FileText size={32} className="text-gray-400 mb-2" />
                  <p className="text-gray-500 font-medium">No documents uploaded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map(doc => (
                    <div
                      key={doc._id}
                      className="flex items-center p-4 border border-gray-100 bg-white hover:border-primary-100 hover:shadow-md rounded-xl transition-all duration-200"
                    >
                      <div className="p-3 bg-primary-50 rounded-xl mr-4 flex-shrink-0">
                        <FileText size={24} className="text-primary-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="text-sm font-medium text-gray-900 truncate" title={doc.name}>
                            {doc.name}
                          </h3>
                          {doc.shared && <Badge variant="secondary" size="sm">Shared</Badge>}
                          
                          {doc.status === 'signed' ? (
                            <Badge variant="success" size="sm" className="gap-1"><CheckCircle size={12}/> Signed</Badge>
                          ) : (
                            <Badge variant="primary" size="sm">Draft v{doc.version || 1}</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{doc.type}</span>
                          <span>&bull;</span>
                          <span>{doc.size}</span>
                          <span>&bull;</span>
                          <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-4 border-l border-gray-100 pl-4">
                        
                        {doc.type === 'PDF' && (
                          <Button variant="ghost" size="sm" className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50" onClick={() => handlePreview(doc)} title="Preview Document">
                            <Eye size={18} />
                          </Button>
                        )}
                        
                        {doc.status !== 'signed' && (
                          <Button variant="ghost" size="sm" className="p-2 text-gray-600 border border-transparent hover:border-primary-200 hover:text-primary-600 hover:bg-primary-50" onClick={() => handleSign(doc)} title="E-Sign Document">
                            <PenTool size={18} />
                          </Button>
                        )}

                        {doc.url && (
                           <a href={doc.url} download target="_blank" rel="noreferrer">
                            <Button variant="ghost" size="sm" className="p-2 text-gray-600 hover:text-gray-900" title="Download via URL">
                              <Download size={18} />
                            </Button>
                          </a>
                        )}
                        
                        {doc.ownerId === user?.id && (
                          <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 ml-2" onClick={() => handleDelete(doc._id)} title="Delete Document">
                            <Trash2 size={18} />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <UploadDocumentModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setUploadModalOpen(false)} 
        onSuccess={fetchDocuments} 
      />

      {previewDoc && (
        <DocumentPreviewModal 
          isOpen={isPreviewModalOpen} 
          onClose={() => setPreviewModalOpen(false)} 
          documentUrl={previewDoc.url} 
          documentName={previewDoc.name} 
        />
      )}

      {signDoc && (
        <ESignatureModal 
          isOpen={isSignModalOpen} 
          onClose={() => setSignModalOpen(false)} 
          documentId={signDoc._id} 
          documentName={signDoc.name} 
          onSuccess={fetchDocuments} 
        />
      )}
    </div>
  );
};