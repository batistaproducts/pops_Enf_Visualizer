import React from 'react';
import { WifiOff, Info } from 'lucide-react';

interface OfflineBannerProps {
  isOnline: boolean;
  offlineCount: number;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOnline, offlineCount }) => {
  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md">
      <div className="flex items-center space-x-2">
        <WifiOff className="w-4 h-4 shrink-0" />
        <span>
          Você está no <strong>Modo de Leitura Offline</strong>. Apenas POPs armazenados localmente estão disponíveis.
        </span>
      </div>
      <span className="bg-slate-950 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-mono ml-2 shrink-0">
        {offlineCount} Salvos
      </span>
    </div>
  );
};
