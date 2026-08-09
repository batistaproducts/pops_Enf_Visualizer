import React from 'react';
import { Home, Bookmark, DownloadCloud, SlidersHorizontal, Settings } from 'lucide-react';
import { UserRole } from '../types';

export type TabType = 'home' | 'search' | 'offline' | 'bookmarks' | 'admin';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  offlineCount: number;
  bookmarkCount: number;
  userRole: UserRole;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  offlineCount,
  bookmarkCount,
  userRole,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900 border-t border-slate-800 text-slate-400 py-1 px-2 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Home / POPs */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-lg transition-colors ${
            activeTab === 'home' ? 'text-teal-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">POPs</span>
        </button>

        {/* Offline Reading Mode */}
        <button
          onClick={() => onTabChange('offline')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-lg relative transition-colors ${
            activeTab === 'offline' ? 'text-amber-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <DownloadCloud className="w-5 h-5" />
            {offlineCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-amber-500 text-slate-950 text-[9px] font-bold px-1 py-0.2 rounded-full min-w-[14px] text-center">
                {offlineCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Offline</span>
        </button>

        {/* Bookmarks / Salvos */}
        <button
          onClick={() => onTabChange('bookmarks')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-lg relative transition-colors ${
            activeTab === 'bookmarks' ? 'text-cyan-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Bookmark className="w-5 h-5" />
            {bookmarkCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-cyan-500 text-slate-950 text-[9px] font-bold px-1 py-0.2 rounded-full min-w-[14px] text-center">
                {bookmarkCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Favoritos</span>
        </button>

        {/* Advanced Filters */}
        <button
          onClick={() => onTabChange('search')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-lg transition-colors ${
            activeTab === 'search' ? 'text-blue-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Filtros</span>
        </button>

        {/* Admin / Configs */}
        <button
          onClick={() => onTabChange('admin')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-lg transition-colors ${
            activeTab === 'admin' ? 'text-purple-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{userRole === 'admin' ? 'Gestão' : 'Config'}</span>
        </button>
      </div>
    </nav>
  );
};
