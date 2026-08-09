import React, { useState } from 'react';
import {
  X,
  FolderGit2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Key,
  Database,
  GitBranch,
} from 'lucide-react';
import { GitHubConfig, PopItem, Hospital } from '../types';
import { syncPopsToGitHub, syncHospitalsToGitHub } from '../lib/githubSync';

interface GitHubConfigModalProps {
  config: GitHubConfig;
  pops: PopItem[];
  hospitals: Hospital[];
  onClose: () => void;
  onSaveConfig: (updated: GitHubConfig) => void;
}

export const GitHubConfigModal: React.FC<GitHubConfigModalProps> = ({
  config,
  pops,
  hospitals,
  onClose,
  onSaveConfig,
}) => {
  const [owner, setOwner] = useState(config.owner || '');
  const [repo, setRepo] = useState(config.repo || '');
  const [branch, setBranch] = useState(config.branch || 'main');
  const [personalToken, setPersonalToken] = useState(config.personalToken || '');
  const [autoSync, setAutoSync] = useState(config.autoSync ?? true);
  const [dataFilePath, setDataFilePath] = useState(config.dataFilePath || 'pops_data.json');
  const [hospitalsFilePath, setHospitalsFilePath] = useState(
    config.hospitalsFilePath || 'hospitals.json'
  );

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  // Execute manual GitHub sync
  const handleTriggerSync = async () => {
    const activeConfig: GitHubConfig = {
      owner,
      repo,
      branch,
      personalToken,
      autoSync,
      lastSync: new Date().toISOString(),
      syncStatus: 'syncing',
      dataFilePath,
      hospitalsFilePath,
    };

    onSaveConfig(activeConfig);
    setIsSyncing(true);
    setSyncFeedback({ type: 'info', message: 'Conectando ao GitHub REST API e enviando commits...' });

    const resPops = await syncPopsToGitHub(pops, activeConfig);
    if (resPops.success) {
      await syncHospitalsToGitHub(hospitals, activeConfig);
      const updatedStatusConfig: GitHubConfig = {
        ...activeConfig,
        syncStatus: 'synced',
        lastSync: new Date().toISOString(),
      };
      onSaveConfig(updatedStatusConfig);
      setSyncFeedback({
        type: 'success',
        message: 'Arquivo pops_data.json e hospitals.json sincronizados com sucesso no GitHub!',
      });
    } else {
      const errorStatusConfig: GitHubConfig = {
        ...activeConfig,
        syncStatus: 'error',
        errorMessage: resPops.message,
      };
      onSaveConfig(errorStatusConfig);
      setSyncFeedback({
        type: 'error',
        message: resPops.message,
      });
    }

    setIsSyncing(false);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: GitHubConfig = {
      owner,
      repo,
      branch,
      personalToken,
      autoSync,
      lastSync: config.lastSync,
      syncStatus: config.syncStatus,
      dataFilePath,
      hospitalsFilePath,
    };
    onSaveConfig(updated);
    alert('Configurações de integração com GitHub salvas com sucesso!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 text-xs">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <FolderGit2 className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-sm font-bold">Integração GitHub & Persistência JSON</h3>
              <p className="text-[11px] text-slate-400">
                Sincronize arquivos JSON da raiz diretamente no repositório GitHub
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

        {/* Sync Status Banner */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-purple-600" />
            <div>
              <span className="font-bold text-slate-800 block">Status da Sincronização</span>
              <span className="text-[10px] text-slate-500">
                Último commit:{' '}
                {config.lastSync ? new Date(config.lastSync).toLocaleString('pt-BR') : 'Nunca'}
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={isSyncing}
            onClick={handleTriggerSync}
            className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 shadow transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {syncFeedback.message && (
          <div
            className={`p-3 text-xs border-b ${
              syncFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : syncFeedback.type === 'error'
                ? 'bg-red-50 text-red-900 border-red-200'
                : 'bg-blue-50 text-blue-900 border-blue-200'
            }`}
          >
            <div className="flex items-start space-x-2">
              {syncFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-snug">{syncFeedback.message}</span>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSaveForm} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Dono do Repositório (User/Org)
              </label>
              <input
                type="text"
                required
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="Ex: lootfan-org"
                className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Nome do Repositório
              </label>
              <input
                type="text"
                required
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="Ex: pops-enfermagem-app"
                className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1 flex items-center space-x-1">
                <GitBranch className="w-3 h-3" />
                <span>Branch Principal</span>
              </label>
              <input
                type="text"
                required
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Arquivo JSON dos POPs
              </label>
              <input
                type="text"
                value={dataFilePath}
                onChange={(e) => setDataFilePath(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1 flex items-center space-x-1">
              <Key className="w-3.5 h-3.5 text-amber-500" />
              <span>Personal Access Token (PAT do GitHub)</span>
            </label>
            <input
              type="password"
              value={personalToken}
              onChange={(e) => setPersonalToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 font-mono text-slate-900"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Necessário permissão <code className="bg-slate-100 px-1 rounded">contents: write</code> no
              GitHub para enviar commits automaticamente.
            </p>
          </div>

          {/* Auto Sync Toggle */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">Sincronização Automática</span>
              <span className="text-[10px] text-slate-500">
                Enviar requisição PUT no GitHub a cada criação ou edição de POP
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
            >
              Fechar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow"
            >
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
