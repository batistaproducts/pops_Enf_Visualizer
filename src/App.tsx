import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Sparkles, Layers, ChevronRight } from 'lucide-react';
import { PopItem, GitHubConfig } from './types';
import { initializeAppData, savePopsToStorage, saveGitHubConfigToStorage } from './lib/storage';
import { Header } from './components/Header';
import { PopCard } from './components/PopCard';
import { PopDetailModal } from './components/PopDetailModal';
import { PopFormModal } from './components/PopFormModal';
import { GitHubConfigModal } from './components/GitHubConfigModal';

export default function App() {
  // Primary State
  const [pops, setPops] = useState<PopItem[]>([]);
  const [githubConfig, setGithubConfig] = useState<GitHubConfig>({
    owner: '',
    repo: '',
    branch: 'main',
    personalToken: '',
    autoSync: true,
    dataFilePath: 'pops_data.json',
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // Modals
  const [selectedPopForDetail, setSelectedPopForDetail] = useState<PopItem | null>(null);
  const [popToEdit, setPopToEdit] = useState<PopItem | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState<boolean>(false);

  // Toast Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. Initial Data Loading
  useEffect(() => {
    async function loadData() {
      try {
        const data = await initializeAppData();
        setPops(data.pops);
        if (data.githubConfig) {
          setGithubConfig(data.githubConfig);
        }
      } catch (error) {
        console.error('Failed to initialize app data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // 2. Categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    pops.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['Todos', ...Array.from(set)];
  }, [pops]);

  // 3. Filtering
  const filteredPops = useMemo(() => {
    return pops.filter((pop) => {
      // Category filter
      if (selectedCategory !== 'Todos' && pop.category !== selectedCategory) {
        return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = pop.title.toLowerCase().includes(query);
        const matchesCode = pop.code.toLowerCase().includes(query);
        const matchesCategory = pop.category.toLowerCase().includes(query);
        const matchesObjective = pop.objective?.toLowerCase().includes(query);

        return matchesTitle || matchesCode || matchesCategory || matchesObjective;
      }

      return true;
    });
  }, [pops, selectedCategory, searchQuery]);

  // Handlers
  const handleSavePop = (savedPop: PopItem) => {
    let updatedPops: PopItem[];
    const exists = pops.some((p) => p.id === savedPop.id);

    if (exists) {
      updatedPops = pops.map((p) => (p.id === savedPop.id ? savedPop : p));
      showToast(`POP ${savedPop.code} atualizado!`);
    } else {
      updatedPops = [savedPop, ...pops];
      showToast(`POP ${savedPop.code} cadastrado!`);
    }

    setPops(updatedPops);
    savePopsToStorage(updatedPops);
    setIsFormModalOpen(false);
    setPopToEdit(null);
  };

  const handleDeletePop = (popId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este POP?')) {
      const updatedPops = pops.filter((p) => p.id !== popId);
      setPops(updatedPops);
      savePopsToStorage(updatedPops);
      showToast('POP excluído com sucesso.');
    }
  };

  const handleSaveGitHubConfig = (newConfig: GitHubConfig) => {
    setGithubConfig(newConfig);
    saveGitHubConfigToStorage(newConfig);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F3FADC] text-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-xl bg-[#f8bdc0] flex items-center justify-center animate-pulse mb-3 shadow-sm border border-[#f8bdc0]">
          <Layers className="w-6 h-6 text-slate-900" />
        </div>
        <h2 className="text-base font-bold text-slate-900 mb-1">EnfermaPOP</h2>
        <p className="text-xs text-slate-600">Carregando visualizador de POPs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3FADC]/30 text-slate-900 font-sans pb-16">
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreatePopModal={() => {
          setPopToEdit(null);
          setIsFormModalOpen(true);
        }}
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 pt-4">
        {/* GitHub Connection Notice */}
        {!githubConfig.personalToken && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start space-x-3 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="bg-amber-100 p-1.5 rounded-lg text-amber-700 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h4 className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-0.5">
                Modo de Demonstração
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                Você não está conectado ao GitHub. Estamos exibindo <strong>POPs de exemplo</strong> para demonstração. Conecte-se para sincronizar seus próprios procedimentos.
              </p>
              <button
                onClick={() => setIsGitHubModalOpen(true)}
                className="mt-2 text-[10px] font-bold text-purple-700 hover:text-purple-800 flex items-center space-x-1 uppercase"
              >
                <span>Configurar GitHub</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Category Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-3 text-xs scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-[#f8bdc0] text-slate-900 border-[#f8bdc0] shadow-xs'
                    : 'bg-white text-slate-700 border-[#f8bdc0]/40 hover:bg-[#F3FADC]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Counter */}
        <div className="my-2 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-1 font-semibold">
            <span>
              {selectedCategory === 'Todos' ? 'Todos os POPs' : selectedCategory}
            </span>
            <span className="text-slate-500 font-mono">({filteredPops.length})</span>
          </div>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-700 font-bold hover:underline text-xs"
            >
              Limpar busca
            </button>
          )}
        </div>

        {/* POPs List */}
        {filteredPops.length > 0 ? (
          <div className="space-y-3 mt-2">
            {filteredPops.map((pop) => (
              <PopCard
                key={pop.id}
                pop={pop}
                onViewPdf={(selected) => setSelectedPopForDetail(selected)}
                onEdit={(p) => {
                  setPopToEdit(p);
                  setIsFormModalOpen(true);
                }}
                onDelete={(id) => handleDeletePop(id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#f8bdc0]/50 p-8 text-center my-6 shadow-xs">
            <div className="w-12 h-12 bg-[#F3FADC] rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Search className="w-6 h-6 text-slate-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Nenhum POP encontrado
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
              Não encontramos procedimentos para a busca informada.
            </p>

            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Todos');
              }}
              className="bg-[#f8bdc0] hover:bg-[#f5a7ab] text-slate-900 font-bold text-xs px-4 py-2 rounded-lg transition-colors border border-[#f8bdc0]"
            >
              Exibir Todos os POPs
            </button>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => {
          setPopToEdit(null);
          setIsFormModalOpen(true);
        }}
        className="fixed bottom-6 right-6 z-20 w-12 h-12 rounded-full bg-[#f8bdc0] hover:bg-[#f5a7ab] text-slate-900 font-bold shadow-lg flex items-center justify-center transition-transform active:scale-95 border border-[#f8bdc0]"
        title="Cadastrar Novo POP"
      >
        <Plus className="w-6 h-6 text-slate-900" />
      </button>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl border border-[#f8bdc0]/40 flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#f8bdc0] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      {selectedPopForDetail && (
        <PopDetailModal
          pop={selectedPopForDetail}
          onClose={() => setSelectedPopForDetail(null)}
        />
      )}

      {isFormModalOpen && (
        <PopFormModal
          initialPop={popToEdit}
          onClose={() => {
            setIsFormModalOpen(false);
            setPopToEdit(null);
          }}
          onSave={handleSavePop}
        />
      )}

      {isGitHubModalOpen && (
        <GitHubConfigModal
          config={githubConfig}
          pops={pops}
          hospitals={[]}
          onClose={() => setIsGitHubModalOpen(false)}
          onSaveConfig={handleSaveGitHubConfig}
        />
      )}
    </div>
  );
}

