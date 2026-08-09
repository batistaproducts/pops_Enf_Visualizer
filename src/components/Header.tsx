import React from 'react';
import { FileText, Search, Plus, FolderGit2 } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCreatePopModal: () => void;
  onOpenGitHubModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenCreatePopModal,
  onOpenGitHubModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#F3FADC] text-slate-900 border-b border-[#f8bdc0]/40 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand Title */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#f8bdc0] flex items-center justify-center text-slate-900 shadow-sm border border-[#f8bdc0]">
              <FileText className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                Gestão de POPs
              </h1>
              <p className="text-xs text-slate-600">
                Visualizador e Cadastro de Procedimentos (PDFs)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:hidden">
            <button
              onClick={onOpenGitHubModal}
              className="bg-white hover:bg-slate-100 text-slate-800 p-1.5 rounded-lg border border-[#f8bdc0]/40"
              title="Configurar GitHub"
            >
              <FolderGit2 className="w-4 h-4 text-purple-700" />
            </button>
            <button
              onClick={onOpenCreatePopModal}
              className="bg-[#f8bdc0] hover:bg-[#f5a7ab] text-slate-900 font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm flex items-center space-x-1 border border-[#f8bdc0]"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Desktop Buttons */}
        <div className="flex items-center space-x-2 w-full sm:w-auto flex-1 max-w-md justify-end">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por título, código ou palavra-chave..."
              className="w-full bg-white text-slate-900 text-xs pl-9 pr-7 py-2 rounded-xl border border-[#f8bdc0]/50 focus:outline-none focus:ring-2 focus:ring-[#f8bdc0] placeholder-slate-400 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs bg-slate-100 rounded-full w-4 h-4 flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>

          <button
            onClick={onOpenGitHubModal}
            className="hidden sm:flex bg-white hover:bg-slate-50 text-slate-800 font-semibold px-3 py-2 rounded-xl text-xs border border-[#f8bdc0]/40 shadow-xs items-center space-x-1.5 transition-colors shrink-0"
            title="Sincronização com GitHub"
          >
            <FolderGit2 className="w-4 h-4 text-purple-700" />
            <span>GitHub</span>
          </button>

          <button
            onClick={onOpenCreatePopModal}
            className="hidden sm:flex bg-[#f8bdc0] hover:bg-[#f5a7ab] text-slate-900 font-bold px-4 py-2 rounded-xl text-xs shadow-sm items-center space-x-1.5 border border-[#f8bdc0] transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar POP</span>
          </button>
        </div>
      </div>
    </header>
  );
};


