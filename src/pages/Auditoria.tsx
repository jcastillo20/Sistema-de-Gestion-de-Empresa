import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../components/common/DataTable';
import { Auditoria } from '../types';
import { ClipboardList, ShieldCheck, Search, Filter, X } from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';
import { cn } from '../lib/utils';
import { apiService } from '../services/apiService';
import { exportService } from '../services/exportService';
import { getExportContext } from '../utils/exportUtils';
import { ExportButton } from '../components/common/ExportButton';

interface AuditoriaPageProps {
  currentUser: any;
}

export default function AuditoriaPage({ currentUser }: AuditoriaPageProps) {
  const [logs, setLogs] = useState<Auditoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters state
  const [filterUser, setFilterUser] = useState<string[]>([]);
  const [filterAction, setFilterAction] = useState<string[]>([]);
  const [filterModule, setFilterModule] = useState<string[]>([]);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  const permissions = usePermissions(currentUser, 'auditoria');

  if (!permissions.acceso) {
    return (
      <div className="clini-denied-container">
        <div className="clini-denied-icon">
          <ShieldCheck size={32} />
        </div>
        <h3 className="clini-denied-title">Acceso Denegado</h3>
        <p className="clini-denied-text">
          No tienes los permisos necesarios para acceder al módulo de auditoría.
        </p>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getAuditoria();
      setLogs(data);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const users = useMemo(() => Array.from(new Set(logs.map(l => l.nombreUsuario))), [logs]);
  const actions = useMemo(() => Array.from(new Set(logs.map(l => l.accion))), [logs]);
  const modules = useMemo(() => Array.from(new Set(logs.map(l => l.tabla))), [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchSearch = searchTerm === '' || 
        (log.nombreUsuario || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (log.idRegistro || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.tabla || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchUser = filterUser.length === 0 || filterUser.includes(log.nombreUsuario);
      const matchAction = filterAction.length === 0 || filterAction.includes(log.accion);
      const matchModule = filterModule.length === 0 || filterModule.includes(log.tabla);
      
      let matchDate = true;
      if (dateStart || dateEnd) {
        const logDate = new Date(log.fecha);
        if (dateStart) {
          const start = new Date(dateStart);
          start.setHours(0, 0, 0, 0);
          matchDate = matchDate && logDate >= start;
        }
        if (dateEnd) {
          const end = new Date(dateEnd);
          end.setHours(23, 59, 59, 999);
          matchDate = matchDate && logDate <= end;
        }
      }

      return matchSearch && matchUser && matchAction && matchModule && matchDate;
    });
  }, [logs, searchTerm, filterUser, filterAction, filterModule, dateStart, dateEnd]);

  const handleExportExcel = async (filteredData?: Auditoria[]) => {
    const { branding, context } = await getExportContext(currentUser);
    const sourceData = filteredData || filteredLogs;
    const dataToExport = sourceData.map(l => ({
      'Fecha': new Date(l.fecha),
      'Usuario': l.nombreUsuario,
      'Acción': l.accion,
      'Módulo': l.tabla,
      'ID Registro': l.idRegistro
    }));

    exportService.exportToExcel(dataToExport, {
      moduleName: 'Auditoría del Sistema',
      fileName: 'Logs_Auditoria',
      branding: branding as any,
      context,
      showSummary: true
    });
  };

  const handleExportPDF = async (filteredData?: Auditoria[]) => {
    const { branding, context } = await getExportContext(currentUser);
    const sourceData = filteredData || filteredLogs;
    const dataToExport = sourceData.map(l => ({
      'Fecha': new Date(l.fecha).toLocaleString(),
      'Usuario': l.nombreUsuario,
      'Acción': l.accion,
      'Módulo': l.tabla
    }));

    exportService.exportToPDF(dataToExport, {
      moduleName: 'Auditoría del Sistema',
      fileName: 'Logs_Auditoria',
      branding: branding as any,
      context
    });
  };

  const toggleFilter = (list: string[], val: string, setter: (val: string[]) => void) => {
    if (list.includes(val)) {
      setter(list.filter(v => v !== val));
    } else {
      setter([...list, val]);
    }
  };

  const MultiSelect = ({ label, options, selected, onToggle }: { label: string, options: string[], selected: string[], onToggle: (val: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="space-y-1.5 flex-1 min-w-[150px]" ref={dropdownRef}>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        <div className="relative">
          <div 
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-600 flex items-center justify-between cursor-pointer transition-all hover:border-primary",
              isOpen && "border-primary ring-2 ring-primary/5 shadow-sm"
            )}
          >
            <span className="truncate">
              {selected.length === 0 ? 'Todos' : `${selected.length} seleccionados`}
            </span>
            <Filter size={12} className={cn("text-slate-400 transition-transform", isOpen && "rotate-180")} />
          </div>
          {isOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto p-1 animate-in fade-in slide-in-from-top-1 duration-200">
              {options.map(opt => (
                <label key={opt} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={selected.includes(opt)} 
                    onChange={() => onToggle(opt)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-primary focus:ring-primary/20"
                  />
                  <span className="text-[11px] font-medium text-slate-600">{opt}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="clini-page-container clini-space-y-ui-g">
      <div className="clini-page-header clini-flex-between-center">
        <div>
          <h2 className="clini-title-main">Auditoría del Sistema</h2>
          <p className="clini-subtitle">Seguimiento detallado de operaciones y cambios de datos.</p>
        </div>
        <div className="flex items-center gap-2">
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-wrap items-end gap-6 border-b border-slate-50 pb-6">
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Buscar Registro</label>
            <div className="relative group/search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-primary transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Usuario o Registro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-[var(--sys-radius-3xl)] text-[11px] font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all"
              />
            </div>
          </div>

          <MultiSelect 
            label="Usuario" 
            options={users} 
            selected={filterUser} 
            onToggle={(v) => toggleFilter(filterUser, v, setFilterUser)} 
          />
          <MultiSelect 
            label="Acción" 
            options={actions} 
            selected={filterAction} 
            onToggle={(v) => toggleFilter(filterAction, v, setFilterAction)} 
          />
          <MultiSelect 
            label="Módulo" 
            options={modules} 
            selected={filterModule} 
            onToggle={(v) => toggleFilter(filterModule, v, setFilterModule)} 
          />
          
          <div className="space-y-1.5 min-w-[200px]">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rango de Fechas</label>
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={dateStart} 
                onChange={(e) => setDateStart(e.target.value)}
                className="flex-1 p-2 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-primary/20" 
              />
              <span className="text-slate-300 text-[10px] font-black">A</span>
              <input 
                type="date" 
                value={dateEnd} 
                onChange={(e) => setDateEnd(e.target.value)}
                className="flex-1 p-2 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-primary/20" 
              />
            </div>
          </div>

          {(searchTerm !== '' || filterUser.length > 0 || filterAction.length > 0 || filterModule.length > 0 || dateStart !== '' || dateEnd !== '') && (
            <button 
              onClick={() => {
                setSearchTerm('');
                setFilterUser([]);
                setFilterAction([]);
                setFilterModule([]);
                setDateStart('');
                setDateEnd('');
              }}
              className="p-2.5 rounded-full border border-slate-100 text-rose-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all flex items-center justify-center h-[44px] w-[44px] shrink-0 active:scale-95 shadow-sm hover:shadow-md"
              title="Limpiar Filtros"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          )}

          <div className="h-8 w-px bg-slate-100 mx-1 self-center" />

          <ExportButton 
            onExcel={() => handleExportExcel(filteredLogs)}
            onPdf={() => handleExportPDF(filteredLogs)}
            showLabel={false}
            className="rounded-full h-[44px] w-[44px] shadow-sm hover:shadow-md self-center"
          />
        </div>

        <DataTable 
          title="Registro de Actividades"
          data={filteredLogs}
          showSearch={false}
          showFilters={false}
          isLoading={isLoading}
          onAdd={undefined}
          columns={[
            { header: 'Fecha', accessor: (a: Auditoria) => <span className="text-[10px] font-mono text-slate-500">{new Date(a.fecha).toLocaleString()}</span>, sortable: true, sortKey: 'fecha' },
            { header: 'Usuario', accessor: 'nombreUsuario', sortable: true, sortKey: 'nombreUsuario' },
            { header: 'Acción', accessor: (a: Auditoria) => (
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter", 
                a.accion === 'INSERT' ? "bg-emerald-100 text-emerald-600" : 
                a.accion === 'UPDATE' ? "bg-amber-100 text-amber-600" : 
                "bg-rose-100 text-rose-600"
              )}>
                {a.accion}
              </span>
            ), sortable: true, sortKey: 'accion' },
            { header: 'Módulo', accessor: 'tabla', sortable: true, sortKey: 'tabla' },
            { header: 'Registro ID', accessor: 'idRegistro', className: 'font-mono text-slate-400' }
          ]}
        />
      </div>
    </div>
  );
}
