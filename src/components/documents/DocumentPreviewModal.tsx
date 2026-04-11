import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the WebWorker for PDF.js securely for Vite
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  documentName: string;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ 
  isOpen, 
  onClose, 
  documentUrl, 
  documentName 
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  if (!isOpen) return null;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  
  const nextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages));
  const prevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75 px-4 p-4 md:p-8">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-full flex flex-col animate-fade-in">
        
        {/* Header toolbar */}
        <div className="flex justify-between items-center px-4 md:px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-800 truncate pr-4">{documentName}</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-md px-2 py-1">
              <button onClick={zoomOut} className="p-1 text-gray-500 hover:text-gray-900 rounded"><ZoomOut size={18} /></button>
              <span className="text-sm font-medium w-12 text-center text-gray-700">{Math.round(scale * 100)}%</span>
              <button onClick={zoomIn} className="p-1 text-gray-500 hover:text-gray-900 rounded"><ZoomIn size={18} /></button>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition-colors p-1 bg-white border border-gray-200 rounded-md">
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* PDF Viewer Body */}
        <div className="flex-1 overflow-auto bg-gray-200 flex justify-center py-8">
           <Document
              file={documentUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="text-gray-500 font-medium my-10">Loading Document...</div>}
              error={<div className="text-red-500 font-medium my-10 bg-white p-4 rounded shadow">Failed to load PDF file. Ensure the server static URL is accessible.</div>}
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale} 
                className="shadow-xl" 
                renderTextLayer={false} 
                renderAnnotationLayer={false} 
              />
            </Document>
        </div>

        {/* Footer Pagination */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-center items-center gap-4">
            <button 
              onClick={prevPage} 
              disabled={pageNumber <= 1}
              className="p-1 rounded-full hover:bg-gray-200 disabled:opacity-50 text-gray-700"
            >
              <ChevronLeft size={24} />
            </button>
            <span className="text-sm font-medium text-gray-700">
              Page {pageNumber} of {numPages || '--'}
            </span>
            <button 
              onClick={nextPage} 
              disabled={pageNumber >= numPages}
              className="p-1 rounded-full hover:bg-gray-200 disabled:opacity-50 text-gray-700"
            >
              <ChevronRight size={24} />
            </button>
        </div>

      </div>
    </div>
  );
};
