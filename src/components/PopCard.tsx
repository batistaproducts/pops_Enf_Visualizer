import React from 'react';
import {
  Eye,
  Edit2,
  Trash2,
  FileText,
  Calendar,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { PopItem } from '../types';

interface PopCardProps {
  pop: PopItem;
  onViewPdf: (pop: PopItem) => void;
  onEdit: (pop: PopItem, e: React.MouseEvent) => void;
  onDelete: (popId: string, popTitle: string, e: React.MouseEvent) => void;
}

export const PopCard: React.FC<PopCardProps> = ({
  pop,
  onViewPdf,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      onClick={() => onViewPdf(pop)}
      className="bg-white rounded-2xl shadow-xs hover:shadow-md border border-[#f8bdc0]/30 p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:border-[#f8bdc0]"
    >
      <div>
        {/* Top Header & Code */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center space-x-2">
            <span className="bg-[#F3FADC] text-slate-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-[#f8bdc0]/40 font-mono">
              {pop.code}
            </span>
            <span className="text-slate-500 text-[11px] font-medium">
              v{pop.version || '1.0'}
            </span>
          </div>

          <span className="bg-[#f8bdc0]/20 text-slate-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-[#f8bdc0]/40">
            {pop.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-800 transition-colors line-clamp-2 leading-snug mb-1.5">
          {pop.title}
        </h3>

        {/* Objective Preview */}
        {pop.objective && (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3 bg-[#F3FADC]/60 p-2.5 rounded-xl border border-[#f8bdc0]/20 italic">
            "{pop.objective}"
          </p>
        )}
      </div>

      {/* Card Actions Row */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="text-[11px] text-slate-500 flex items-center space-x-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{pop.lastUpdated || 'Recente'}</span>
        </div>

        {/* Visualizar, Editar, Excluir Buttons */}
        <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onViewPdf(pop)}
            className="bg-[#f8bdc0] hover:bg-[#f5a7ab] text-slate-900 font-bold px-2.5 py-1.5 rounded-lg text-xs flex items-center space-x-1 shadow-xs border border-[#f8bdc0] transition-colors"
            title="Visualizar PDF"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Visualizar</span>
          </button>

          <button
            onClick={(e) => onEdit(pop, e)}
            className="bg-[#F3FADC] hover:bg-[#e8f5cb] text-slate-800 font-semibold px-2.5 py-1.5 rounded-lg text-xs flex items-center space-x-1 border border-[#f8bdc0]/40 transition-colors"
            title="Editar POP"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-700" />
            <span className="hidden sm:inline">Editar</span>
          </button>

          <button
            onClick={(e) => onDelete(pop.id, pop.title, e)}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold p-1.5 rounded-lg text-xs border border-rose-200 transition-colors"
            title="Excluir POP"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

