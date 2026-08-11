import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Edit,
  Trash2,
  Download,
  Upload,
  FolderGit2,
  Building,
  Copy,
} from 'lucide-react';
import { PopItem, Hospital, GitHubConfig } from '../types';

interface AdminPanelModalProps {
  pops: PopItem[];
  hospitals: Hospital[];
  githubConfig: GitHubConfig;
  onClose: () => void;
  onOpenCreateModal: () => void;
  onEditPop: (pop: PopItem) => void;
  onDeletePop: (popId: string) => void;
  onOpenGitHubModal: () => void;
  onOpenHospitalModal: () => void;
  onImportPopsJson: (imported: PopItem[]) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  pops,
  hospitals,
  githubConfig,
  onClose,
  onOpenCreateModal,
  onEditPop,
  onDeletePop,
  onOpenGitHubModal,
  onOpenHospitalModal,
  onImportPopsJson,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  const filteredPops = pops.filter(
    (p) =>
      p.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(filterQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(filterQuery.toLowerCase())
  );

  // Export JSON file download
  const handleExportJson = () => {
    const jsonStr = JSON.stringify(pops, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pops_data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import JSON file upload
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            onImportPopsJson(parsed);
            alert(`${parsed.length} POPs importados com sucesso!`);
          } else {
            alert('Arquivo JSON inválido. Deve conter uma lista de POPs.');
          }
        } catch (err) {
          alert('Erro ao importar JSON: ' + (err as Error).message);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 text-xs">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
              ⚙
            </div>
            <div>
              <h3 className="text-sm font-bold">Painel do Administrador (Gestão de POPs/Eenfermagem)</h3>
              <p className="text-[11px] text-slate-400">
                Gerencie catálogo de procedimentos, instituições e arquivos de persistência
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onOpenCreateModal();
              }}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Novo POP</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenHospitalModal();
              }}
              className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1"
            >
              <Building className="w-4 h-4 text-cyan-600" />
              <span>Hospitais ({hospitals.length})</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenGitHubModal();
              }}
              className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1"
            >
              <FolderGit2 className="w-4 h-4 text-purple-600" />
              <span>GitHub Config</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportJson}
              className="bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1.5 rounded-lg flex items-center space-x-1 font-medium"
              title="Exportar pops_data.json"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Exportar JSON</span>
            </button>

            <label className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-2.5 py-1.5 rounded-lg flex items-center space-x-1 font-medium cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Importar JSON</span>
              <input
                type="file"
                accept="application/json"
                onChange={handleImportJson}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Filter Input */}
        <div className="p-3 bg-white border-b border-slate-200">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filtrar por código, título ou categoria no painel..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5"
          />
        </div>

        {/* POPs Table List */}
        <div className="p-3 overflow-y-auto flex-1 max-h-[50vh]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold border-b border-slate-200">
                <th className="p-2">Código</th>
                <th className="p-2">Título do POP</th>
                <th className="p-2 hidden sm:table-cell">Categoria</th>
                <th className="p-2 hidden sm:table-cell">Versão</th>
                <th className="p-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredPops.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-2 font-mono font-bold text-teal-700">{p.code}</td>
                  <td className="p-2 font-medium">{p.title}</td>
                  <td className="p-2 hidden sm:table-cell text-slate-500">{p.category}</td>
                  <td className="p-2 hidden sm:table-cell font-mono">{p.version}</td>
                  <td className="p-2 text-right space-x-1">
                    <button
                      onClick={() => {
                        onClose();
                        onEditPop(p);
                      }}
                      className="p-1 text-slate-600 hover:text-teal-700 bg-slate-100 hover:bg-teal-50 rounded"
                      title="Editar POP"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Excluir o POP ${p.code} - ${p.title}?`)) {
                          onDeletePop(p.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded"
                      title="Excluir POP"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Total cadastrado: {pops.length} POPs em Enfermagem</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-900 text-white font-bold rounded-lg"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
