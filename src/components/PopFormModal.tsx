import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  FileText,
  Upload,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { PopItem, PopStep } from '../types';
import { readFileAsDataUrl } from '../lib/storage';
import { generatePdfBlobUrl } from '../lib/pdfGenerator';

interface PopFormModalProps {
  initialPop: PopItem | null;
  onClose: () => void;
  onSave: (savedPop: PopItem) => void;
}

export const PopFormModal: React.FC<PopFormModalProps> = ({
  initialPop,
  onClose,
  onSave,
}) => {
  const isEditing = !!initialPop;

  // Form states
  const [code, setCode] = useState(
    initialPop?.code || `POP-00${Math.floor(Math.random() * 90 + 10)}`
  );
  const [title, setTitle] = useState(initialPop?.title || '');
  const [category, setCategory] = useState(initialPop?.category || 'Procedimentos Invasivos');
  const [version, setVersion] = useState(initialPop?.version || '1.0');
  const [author, setAuthor] = useState(initialPop?.author || 'Enfermeiro Responsável');
  const [objective, setObjective] = useState(initialPop?.objective || '');

  // Dynamic Lists
  const [materials, setMaterials] = useState<string[]>(
    initialPop?.materials && initialPop.materials.length > 0
      ? initialPop.materials
      : ['Luvas de procedimento', 'Álcool 70%']
  );

  const [steps, setSteps] = useState<PopStep[]>(
    initialPop?.steps && initialPop.steps.length > 0
      ? initialPop.steps
      : [
          {
            stepNumber: 1,
            title: 'Higienização e Prep',
            description: 'Realizar higienização e conferir a identificação.',
          },
        ]
  );

  // Custom PDF Upload
  const [customPdfDataUrl, setCustomPdfDataUrl] = useState<string | undefined>(
    initialPop?.customPdfDataUrl
  );
  const [pdfFileName, setPdfFileName] = useState<string | undefined>(
    initialPop?.pdfFileName || `${code}.pdf`
  );

  // PDF File Upload Handler
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const dataUrl = await readFileAsDataUrl(file);
        setCustomPdfDataUrl(dataUrl);
        setPdfFileName(file.name);
      } catch (err) {
        alert('Erro ao carregar o arquivo PDF: ' + (err as Error).message);
      }
    }
  };

  // Step Handlers
  const addStep = () => {
    const newStepNum = steps.length + 1;
    setSteps([
      ...steps,
      {
        stepNumber: newStepNum,
        title: `Passo ${newStepNum}`,
        description: '',
      },
    ]);
  };

  const updateStep = (index: number, field: keyof PopStep, value: string) => {
    const updated = [...steps];
    if (field === 'stepNumber') {
      updated[index].stepNumber = parseInt(value) || index + 1;
    } else {
      updated[index][field] = value;
    }
    setSteps(updated);
  };

  const removeStep = (index: number) => {
    const filtered = steps.filter((_, i) => i !== index);
    const reindexed = filtered.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setSteps(reindexed);
  };

  // Materials Handlers
  const addMaterial = () => setMaterials([...materials, '']);
  const updateMaterial = (idx: number, val: string) => {
    const updated = [...materials];
    updated[idx] = val;
    setMaterials(updated);
  };
  const removeMaterial = (idx: number) => setMaterials(materials.filter((_, i) => i !== idx));

  // Save Form Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !code.trim()) {
      alert('Por favor, preencha o Título e o Código do POP.');
      return;
    }

    const popToSave: PopItem = {
      id: initialPop?.id || `pop-${Date.now()}`,
      code: code.trim(),
      title: title.trim(),
      category: category.trim(),
      hospitalIds: initialPop?.hospitalIds || [],
      version: version.trim(),
      lastUpdated: new Date().toISOString().split('T')[0],
      author: author.trim(),
      revisedBy: initialPop?.revisedBy || 'Comissão de Qualidade',
      objective: objective.trim(),
      targetAudience: initialPop?.targetAudience || 'Equipe Assistencial',
      materials: materials.filter((m) => m.trim() !== ''),
      keywords: initialPop?.keywords || [category.toLowerCase()],
      steps: steps.map((s, idx) => ({ ...s, stepNumber: idx + 1 })),
      risks: initialPop?.risks || [],
      references: initialPop?.references || '',
      pdfFileName: pdfFileName || `${code}.pdf`,
      customPdfDataUrl: customPdfDataUrl,
      isOfflineAvailable: true,
    };

    // Auto-generate PDF DataURL if no custom PDF attached
    if (!popToSave.customPdfDataUrl) {
      popToSave.customPdfDataUrl = generatePdfBlobUrl(popToSave);
    }

    onSave(popToSave);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-[#f8bdc0]/50">
        {/* Header Bar */}
        <div className="bg-[#F3FADC] p-4 flex items-center justify-between border-b border-[#f8bdc0]/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#f8bdc0] flex items-center justify-center text-slate-900 font-bold border border-[#f8bdc0]">
              <FileText className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {isEditing ? `Editar POP: ${initialPop.code}` : 'Cadastrar Novo POP (PDF)'}
              </h3>
              <p className="text-xs text-slate-600">
                Preencha as informações do procedimento e anexe o documento PDF.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 p-1 rounded-lg hover:bg-[#f8bdc0]/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Identificação */}
          <div className="bg-[#F3FADC]/40 p-3.5 rounded-xl border border-[#f8bdc0]/30 space-y-3">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
              1. Identificação do POP
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Código *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ex: POP-001"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f8bdc0]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Categoria *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f8bdc0]"
                >
                  <option value="Procedimentos Invasivos">Procedimentos Invasivos</option>
                  <option value="Medicação e Infusão">Medicação e Infusão</option>
                  <option value="Higiene e Conforto">Higiene e Conforto</option>
                  <option value="Sinais Vitais e Avaliação">Sinais Vitais e Avaliação</option>
                  <option value="Emergência e Terapia Intensiva">Emergência e Terapia Intensiva</option>
                  <option value="Cuidados Fundamentais">Cuidados Fundamentais</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Título do Procedimento *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Cateterismo Vesical de Demora"
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#f8bdc0]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Objetivo
              </label>
              <textarea
                rows={2}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Descreva resumidamente o objetivo deste POP..."
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f8bdc0]"
              />
            </div>
          </div>

          {/* Upload de PDF */}
          <div className="bg-[#F3FADC]/40 p-3.5 rounded-xl border border-[#f8bdc0]/30 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                2. Arquivo PDF do POP
              </h4>
              {customPdfDataUrl && (
                <span className="text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>PDF Anexado</span>
                </span>
              )}
            </div>

            <div className="border-2 border-dashed border-[#f8bdc0] rounded-xl p-3 bg-white text-center">
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <p className="text-xs font-semibold text-slate-800">
                {pdfFileName ? `Arquivo: ${pdfFileName}` : 'Carregar arquivo PDF oficial'}
              </p>
              <p className="text-[10px] text-slate-500 mb-2">
                Anexe seu PDF (.pdf). Caso não anexe, um PDF limpo será gerado automaticamente.
              </p>
              <label className="bg-[#f8bdc0] hover:bg-[#f5a7ab] text-slate-900 font-bold text-xs px-3 py-1.5 rounded-lg inline-block cursor-pointer transition-colors border border-[#f8bdc0]">
                <span>Selecionar PDF</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Passos e Etapas */}
          <div className="bg-[#F3FADC]/40 p-3.5 rounded-xl border border-[#f8bdc0]/30 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                3. Etapas do Procedimento ({steps.length})
              </h4>

              <button
                type="button"
                onClick={addStep}
                className="bg-[#f8bdc0] hover:bg-[#f5a7ab] text-slate-900 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1 border border-[#f8bdc0]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Passo</span>
              </button>
            </div>

            <div className="space-y-2">
              {steps.map((s, idx) => (
                <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-800 text-[11px] bg-[#F3FADC] px-2 py-0.5 rounded font-mono">
                      Passo {idx + 1}
                    </span>
                    <input
                      type="text"
                      placeholder="Título do passo..."
                      value={s.title}
                      onChange={(e) => updateStep(idx, 'title', e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1 font-semibold text-slate-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Remover passo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Descrição do passo..."
                    value={s.description}
                    onChange={(e) => updateStep(idx, 'description', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 focus:outline-none text-slate-800"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Materiais */}
          <div className="bg-[#F3FADC]/40 p-3.5 rounded-xl border border-[#f8bdc0]/30 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                Materiais
              </h4>
              <button
                type="button"
                onClick={addMaterial}
                className="text-slate-800 font-bold text-[10px] flex items-center space-x-0.5"
              >
                <Plus className="w-3 h-3" />
                <span>Adicionar Material</span>
              </button>
            </div>

            {materials.map((mat, idx) => (
              <div key={idx} className="flex items-center space-x-1">
                <input
                  type="text"
                  value={mat}
                  onChange={(e) => updateMaterial(idx, e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded px-2 py-1"
                  placeholder="Nome do material..."
                />
                <button
                  type="button"
                  onClick={() => removeMaterial(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-[#f8bdc0] hover:bg-[#f5a7ab] text-slate-900 font-bold rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors border border-[#f8bdc0]"
            >
              <Save className="w-4 h-4" />
              <span>Salvar POP</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

