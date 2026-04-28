import React from 'react';
import { Package, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PaquetePaciente } from '../../types';

interface PackageCardProps {
  pack: PaquetePaciente;
  className?: string;
  key?: string | number;
}

export default function PackageCard({ pack, className }: PackageCardProps) {
  const progress = (pack.citasConsumidas / pack.cantCitas) * 100;
  
  return (
    <div className={cn("pg-card overflow-hidden group border border-slate-100 flex flex-col h-full hover:shadow-lg hover:shadow-primary/5 transition-all duration-300", className)}>
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
              <Package size={20} />
            </div>
            <div>
              <p className="font-black text-slate-900 leading-tight truncate max-w-[150px]">{pack.nombre}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Calendar size={10} className="text-slate-400" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {new Date(pack.fechaContrato).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          <span className={cn(
            "pg-status-pill shrink-0", 
            pack.estado === 'ACTIVO' ? "pg-status--active" : 
            pack.estado === 'AGOTADO' ? "bg-amber-100 text-amber-600" : "pg-status--inactive"
          )}>
            {pack.estado}
          </span>
        </div>

        {/* Barra de Progreso UX */}
        <div className="space-y-2 mt-2">
          <div className="flex justify-between text-[11px] font-black uppercase tracking-wider">
            <span className="text-slate-400">Progreso</span>
            <span className="text-primary">{pack.citasConsumidas} <span className="opacity-40">/</span> {pack.cantCitas}</span>
          </div>
          <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-700 ease-out shadow-[0_0_8px_rgba(var(--sys-color-primary-raw),0.4)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="px-5 py-3 bg-slate-50/50 flex items-center justify-between border-t border-slate-50">
        <div className="space-y-0.5">
          <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Inversión (Snapshot)</p>
          <p className="text-sm font-black text-slate-900">S/ {pack.precioVenta.toLocaleString()}</p>
        </div>
        <div className="text-right space-y-0.5">
          <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Sede</p>
          <p className="text-[11px] font-black text-slate-700 truncate max-w-[80px]">{pack.sede}</p>
        </div>
      </div>
    </div>
  );
}
