import React, { useState } from 'react';
import { X, Building2, Check, Plus, Trash2, MapPin } from 'lucide-react';
import { Hospital, UserRole } from '../types';

interface HospitalSelectorModalProps {
  hospitals: Hospital[];
  selectedHospitalId: string;
  userRole: UserRole;
  onSelectHospital: (hospitalId: string) => void;
  onClose: () => void;
  onAddHospital: (hospital: Hospital) => void;
  onDeleteHospital: (hospitalId: string) => void;
}

export const HospitalSelectorModal: React.FC<HospitalSelectorModalProps> = ({
  hospitals,
  selectedHospitalId,
  userRole,
  onSelectHospital,
  onClose,
  onAddHospital,
  onDeleteHospital,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHospName, setNewHospName] = useState('');
  const [newHospCode, setNewHospCode] = useState('');
  const [newHospCity, setNewHospCity] = useState('');
  const [newHospUnits, setNewHospUnits] = useState('UTI Adulto, Pronto Socorro');

  const handleCreateHospital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHospName || !newHospCode) {
      alert('Preencha o nome e o código do hospital.');
      return;
    }

    const created: Hospital = {
      id: `hosp-${Date.now()}`,
      name: newHospName,
      code: newHospCode.toUpperCase(),
      city: newHospCity || 'São Paulo - SP',
      units: newHospUnits.split(',').map((u) => u.trim()),
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    };

    onAddHospital(created);
    setNewHospName('');
    setNewHospCode('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold">Selecionar Hospital / Órgão</h3>
              <p className="text-[11px] text-slate-400">
                Alterne o contexto de trabalho para filtrar POPs específicos
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

        {/* List of Hospitals */}
        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {/* Option: All Hospitals */}
          <div
            onClick={() => {
              onSelectHospital('');
              onClose();
            }}
            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              selectedHospitalId === ''
                ? 'bg-cyan-50 border-cyan-500 text-cyan-900 font-bold shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-mono text-xs font-bold text-slate-700">
                ALL
              </div>
              <div>
                <h4 className="text-xs font-bold">Todos os Hospitais / Geral</h4>
                <p className="text-[11px] text-slate-500">Exibir POPs universais e de todas as unidades</p>
              </div>
            </div>
            {selectedHospitalId === '' && <Check className="w-5 h-5 text-cyan-600" />}
          </div>

          {/* Specific Hospitals */}
          {hospitals.map((h) => {
            const isSelected = selectedHospitalId === h.id;
            return (
              <div
                key={h.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div
                  onClick={() => {
                    onSelectHospital(h.id);
                    onClose();
                  }}
                  className="flex-1 cursor-pointer flex items-center space-x-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-mono text-xs font-bold">
                    {h.code}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight">{h.name}</h4>
                    <p className="text-[10px] text-slate-500 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{h.city}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {isSelected && <Check className="w-5 h-5 text-teal-600" />}
                  {userRole === 'admin' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Remover hospital ${h.name}?`)) {
                          onDeleteHospital(h.id);
                        }
                      }}
                      className="text-slate-300 hover:text-red-600 p-1"
                      title="Excluir hospital"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Hospital Form Toggle for Admin */}
        {userRole === 'admin' && (
          <div className="p-3 bg-slate-50 border-t border-slate-200">
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Cadastrar Novo Hospital / Clínica</span>
              </button>
            ) : (
              <form onSubmit={handleCreateHospital} className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-800 text-[11px]">Novo Hospital/Clínica</h4>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Nome do Hospital/Clínica *"
                      required
                      value={newHospName}
                      onChange={(e) => setNewHospName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Sigla *"
                      required
                      value={newHospCode}
                      onChange={(e) => setNewHospCode(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 uppercase font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Cidade - UF"
                  value={newHospCity}
                  onChange={(e) => setNewHospCity(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded p-1.5 focus:outline-none"
                />

                <input
                  type="text"
                  placeholder="Setores (separados por vírgula)"
                  value={newHospUnits}
                  onChange={(e) => setNewHospUnits(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded p-1.5 focus:outline-none"
                />

                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded"
                  >
                    Salvar Hospital
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="py-1.5 px-3 bg-slate-200 text-slate-700 rounded"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
