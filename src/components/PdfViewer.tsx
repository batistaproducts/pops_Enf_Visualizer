import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker using a CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PdfViewerProps {
  dataUrl: string;
  zoom?: number;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ dataUrl, zoom = 100 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadPdf = async () => {
      try {
        // Convert data URL to typed array if it's base64
        let pdfData: any = dataUrl;
        if (dataUrl.startsWith('data:application/pdf;base64,')) {
          const base64 = dataUrl.split(',')[1];
          const binaryStr = atob(base64);
          const len = binaryStr.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          pdfData = bytes;
        }

        const loadingTask = pdfjsLib.getDocument(pdfData);
        const pdf = await loadingTask.promise;
        
        if (!isMounted) return;
        setNumPages(pdf.numPages);
        setLoading(false);

        // Clear previous canvases
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // Render all pages
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: (zoom / 100) * 1.5 }); // High DPI scaling
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          canvas.className = "max-w-full h-auto mb-4 shadow-md bg-white";
          
          if (containerRef.current) {
            containerRef.current.appendChild(canvas);
          }

          if (context) {
            const renderContext = {
              canvasContext: context,
              viewport: viewport,
            };
            await page.render(renderContext).promise;
          }
        }
      } catch (err) {
        console.error('Error rendering PDF:', err);
        if (isMounted) {
          setError('Não foi possível carregar o visualizador de PDF neste navegador.');
          setLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
    };
  }, [dataUrl, zoom]);

  return (
    <div className="w-full flex flex-col items-center overflow-x-hidden p-2 sm:p-4">
      {loading && (
        <div className="flex flex-col items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-slate-500 font-medium">Processando documento...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center max-w-sm mx-auto my-8">
          <p className="text-sm font-semibold mb-2">{error}</p>
          <p className="text-[11px]">Você ainda pode baixar o arquivo PDF para visualizar offline.</p>
        </div>
      )}

      <div 
        ref={containerRef} 
        className="w-full flex flex-col items-center"
      />
    </div>
  );
};
