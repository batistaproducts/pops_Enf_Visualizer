import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  Printer,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckSquare,
  BookOpen,
} from 'lucide-react';
import { PopItem } from '../types';
import { generatePdfBlobUrl } from '../lib/pdfGenerator';
import { PdfViewer } from './PdfViewer';

interface PopDetailModalProps {
  pop: PopItem | null;
  onClose: () => void;
}

export const PopDetailModal: React.FC<PopDetailModalProps> = ({
  pop,
  onClose,
}) => {
  if (!pop) return null;

  const [activeTab, setActiveTab] = useState<'pdf' | 'steps'>('pdf');
  const [pdfZoom, setPdfZoom] = useState<number>(100);

  // Handle PDF Download
  const handleDownloadPdf = () => {
    let dataUrl = pop.customPdfDataUrl;
    if (!dataUrl) {
      dataUrl = generatePdfBlobUrl(pop);
    }
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = pop.pdfFileName || `${pop.code}-${pop.title.replace(/\s+/g, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Print
  const handlePrint = () => {
    window.print();
  };

  const pdfDataUrl = pop.customPdfDataUrl || generatePdfBlobUrl(pop);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-[#f8bdc0]/50">
        {/* Header Bar */}
        <div className="bg-[#F3FADC] text-slate-900 p-4 flex items-start justify-between border-b border-[#f8bdc0]/40">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="bg-[#f8bdc0] text-slate-900 text-xs font-bold px-2.5 py-0.5 rounded-md font-mono">
                {pop.code}
              </span>
              <span className="bg-white text-slate-700 text-xs px-2 py-0.5 rounded-md border border-[#f8bdc0]/30 font-medium">
                Versão {pop.version || '1.0'}
              </span>
              <span className="bg-[#f8bdc0]/30 text-slate-900 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                {pop.category}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {pop.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 p-1 rounded-lg hover:bg-[#f8bdc0]/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-700 flex-wrap gap-2">
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPdf}
              className="bg-[#f8bdc0] hover:bg-[#f5a7ab] text-slate-900 font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-xs border border-[#f8bdc0] transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Baixar PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-medium transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Imprimir</span>
            </button>
          </div>

          {/* View Tab Selector & Zoom */}
          <div className="flex items-center space-x-3">
            <div className="flex bg-slate-200/80 p-0.5 rounded-lg">
              <button
                onClick={() => setActiveTab('pdf')}
                className={`px-3 py-1 rounded-md font-semibold text-xs transition-colors flex items-center space-x-1 ${
                  activeTab === 'pdf'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-slate-800" />
                <span>Documento PDF</span>
              </button>

              <button
                onClick={() => setActiveTab('steps')}
                className={`px-3 py-1 rounded-md font-semibold text-xs transition-colors flex items-center space-x-1 ${
                  activeTab === 'steps'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5 text-slate-800" />
                <span>Passos do Procedimento</span>
              </button>
            </div>

            {activeTab === 'pdf' && (
              <div className="hidden sm:flex items-center space-x-1 bg-white border border-slate-300 rounded-lg p-1">
                <button
                  onClick={() => setPdfZoom(Math.max(50, pdfZoom - 20))}
                  className="p-1 hover:bg-slate-100 rounded text-slate-700"
                  title="Reduzir zoom"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono px-1 font-semibold">{pdfZoom}%</span>
                <button
                  onClick={() => setPdfZoom(Math.min(200, pdfZoom + 20))}
                  className="p-1 hover:bg-slate-100 rounded text-slate-700"
                  title="Aumentar zoom"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPdfZoom(100)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-700"
                  title="Resetar zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 overflow-y-auto flex-1 text-slate-800 bg-[#F3FADC]/30">
          {activeTab === 'pdf' ? (
            <div className="w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-300 min-h-[500px] flex flex-col items-center">
              <div className="w-full h-full max-h-[650px] overflow-auto bg-slate-50">
                <PdfViewer dataUrl={pdfDataUrl} zoom={pdfZoom} />
              </div>
              
              {/* Mobile Info Tip */}
              <div className="sm:hidden w-full bg-blue-50 border-t border-blue-100 p-2 text-center">
                <p className="text-[10px] text-blue-700 font-medium">
                  💡 Arraste para navegar no documento.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-2xl mx-auto bg-white p-5 rounded-2xl border border-[#f8bdc0]/30 shadow-xs">
              {/* Objective */}
              {pop.objective && (
                <div className="bg-[#F3FADC] border-l-4 border-[#f8bdc0] p-3 rounded-r-xl">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Objetivo
                  </h4>
                  <p className="text-xs text-slate-800 leading-relaxed">{pop.objective}</p>
                </div>
              )}

              {/* Steps */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Passo a Passo
                </h4>
                <div className="space-y-2.5">
                  {pop.steps && pop.steps.length > 0 ? (
                    pop.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="bg-[#F3FADC]/40 p-3 rounded-xl border border-[#f8bdc0]/30"
                      >
                        <span className="text-xs font-bold text-slate-900 block mb-1">
                          Passo {step.stepNumber || idx + 1}: {step.title}
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed">{step.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">Nenhum passo cadastrado.</p>
                  )}
                </div>
              </div>

              {/* Materials */}
              {pop.materials && pop.materials.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Materiais Necessários
                  </h4>
                  <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {pop.materials.map((mat, i) => (
                      <li key={i}>{mat}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#F3FADC] border-t border-[#f8bdc0]/40 p-3 flex items-center justify-between text-xs">
          <span className="text-slate-600">
            Código: <strong className="text-slate-900">{pop.code}</strong>
          </span>

          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-1.5 rounded-lg transition-colors"
          >
            Fechar Visualizador
          </button>
        </div>
      </div>
    </div>
  );
};

