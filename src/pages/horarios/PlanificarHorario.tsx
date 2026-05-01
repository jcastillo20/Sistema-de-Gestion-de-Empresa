import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, Plus, Clock } from 'lucide-react';

export default function PlanificarHorario() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/horarios')}
            className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-primary transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Planificar Nuevo Horario</h2>
            <p className="text-xs text-slate-500 font-bold">Configuración de bloques maestros y rotaciones</p>
          </div>
        </div>
        <button className="px-6 py-3 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2">
          <Save size={18} />
          Publicar Horario
        </button>
      </div>

      <div className="clini-card p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Terapeuta</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none">
                <option>Seleccionar Especialista...</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mes de Aplicación</label>
              <input type="month" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Definición de Bloques</h3>
              <button className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors">
                <Plus size={18} />
              </button>
            </div>
            <div className="border-2 border-dashed border-slate-100 rounded-3xl p-12 text-center">
              <Clock size={32} className="mx-auto text-slate-200 mb-2" />
              <p className="text-xs font-bold text-slate-400">Presiona el botón "+" para añadir un bloque de trabajo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
