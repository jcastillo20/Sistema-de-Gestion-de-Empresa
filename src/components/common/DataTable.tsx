import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { AlertModal } from './AlertModal';
import { apiService } from '../../services/apiService';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  sortable?: boolean;
  sortKey?: keyof T;
  className?: string;
}

interface DataTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  customActions?: (item: T) => React.ReactNode;
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  showSearch?: boolean;
  showFilters?: boolean;
}

export function DataTable<T>({ 
  title, 
  data, 
  columns, 
  onAdd, 
  onEdit, 
  onDelete,
  customActions,
  isLoading,
  searchPlaceholder = "Buscar...",
  searchFields,
  showSearch = true,
  showFilters = true
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: '',
    direction: null
  });

  // Cargar configuración de registros por página
  useEffect(() => {
    const loadPageSize = async () => {
      try {
        const configs = await apiService.getConfiguracion();
        const configPageSize = configs.find(c => c.clave === 'REGISTROS_PAGINA')?.valor;
        if (configPageSize) setPageSize(Number(configPageSize));
      } catch (e) {
        console.error("Error loading page size", e);
      }
    };
    loadPageSize();
    window.addEventListener('configUpdated', loadPageSize);
    return () => window.removeEventListener('configUpdated', loadPageSize);
  }, []);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null;
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Búsqueda
    if (searchTerm) {
      result = result.filter(item => {
        const valuesToSearch = searchFields 
          ? searchFields.map(f => String(item[f] || '').toLowerCase())
          : Object.values(item as any).map(v => String(v || '').toLowerCase());
        
        return valuesToSearch.some(val => val.includes(searchTerm.toLowerCase()));
      });
    }

    // Ordenamiento
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a: any, b: any) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig, searchFields]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedData.length / pageSize));
  
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedData.slice(start, start + pageSize);
  }, [filteredAndSortedData, currentPage, pageSize]);

  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteClick = (item: T) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete && onDelete) {
      onDelete(itemToDelete);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="bg-white rounded-[var(--sys-radius-3xl)] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full animate-in fade-in duration-500">
      {/* Delete Confirmation Modal */}
      <AlertModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Cambiar Estado"
        message={`¿Está seguro que desea cambiar el estado de este registro? El registro no se eliminará permanentemente para mantener el historial.`}
        type="warning"
        onConfirm={confirmDelete}
      />
      <div className="p-6 border-b border-slate-50 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">{title}</h3>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Total: {data.length} registros</p>
          </div>
          <div className="flex items-center gap-3">
            {onAdd && (
              <button 
                onClick={onAdd}
                className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wider hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0"
              >
                <Plus size={16} strokeWidth={3} />
                <span>Nuevo Registro</span>
              </button>
            )}
          </div>
        </div>

        {(showSearch || showFilters) && (
          <div className="flex flex-col sm:flex-row gap-4">
            {showSearch && (
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-primary/5 w-full transition-all"
                />
              </div>
            )}
            {showFilters && (
              <div className="flex items-center gap-2">
                <button className="p-2.5 rounded-2xl border border-slate-100 text-slate-500 hover:bg-slate-50 transition-all" title="Filtrar">
                  <Filter size={18} />
                </button>
                <button className="p-2.5 rounded-2xl border border-slate-100 text-slate-500 hover:bg-slate-50 transition-all" title="Exportar">
                  <Download size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto min-h-0 flex-1">
        <table className="pg-table w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              {columns.map((column, idx) => (
                <th 
                  key={idx} 
                  className={cn(
                    "px-6 py-5 whitespace-nowrap",
                    column.sortable && "cursor-pointer hover:text-primary transition-colors",
                    column.className
                  )}
                  onClick={() => column.sortable && column.sortKey && handleSort(column.sortKey as string)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && (
                      <span className="text-slate-400">
                        {sortConfig.key === column.sortKey ? (
                          sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-primary" /> : <ChevronDown size={14} className="text-primary" />
                        ) : (
                          <ChevronsUpDown size={14} className="opacity-40" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {(onEdit || onDelete || customActions) && (
                <th className="px-6 py-5 text-right font-black uppercase tracking-widest bg-slate-50/50">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-20 text-center">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((item, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-50/30 transition-colors group">
                  {columns.map((column, colIdx) => (
                    <td key={colIdx} className={cn("px-6 py-4 text-xs font-medium text-slate-600", column.className)}>
                      {typeof column.accessor === 'function' 
                        ? column.accessor(item) 
                        : (item[column.accessor] as any)}
                    </td>
                  ))}
                  {(onEdit || onDelete || customActions) && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {customActions && customActions(item)}
                        {onEdit && (
                          <button 
                            onClick={() => onEdit(item)}
                            className="p-2 rounded-xl text-primary bg-primary/5 hover:bg-primary/10 transition-all active:scale-90"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                        {onDelete && (
                          <button 
                            onClick={() => handleDeleteClick(item)}
                            className="p-2 rounded-xl text-rose-500 bg-rose-50 hover:bg-rose-100 transition-all active:scale-90"
                            title="Cambiar Estado"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 text-slate-300">
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center">
                      <Search size={40} strokeWidth={1} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-black text-slate-800 uppercase tracking-tight">Sin resultados</p>
                      <p className="text-xs font-medium text-slate-400">Prueba ajustando tus filtros de búsqueda.</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-5 border-t border-slate-50 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Página <span className="text-primary">{currentPage}</span> de {totalPages}
          </p>
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-2xl">
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              // Only show some pages if many
              if (totalPages > 5 && Math.abs(page - currentPage) > 1 && page !== 1 && page !== totalPages) {
                if (Math.abs(page - currentPage) === 2) return <span key={i} className="px-1 text-slate-300">...</span>;
                return null;
              }
              return (
                <button
                  key={i}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-8 h-8 rounded-xl text-[10px] font-black transition-all",
                    currentPage === page ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-500 hover:bg-white"
                  )}
                >
                  {page}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-100 bg-white text-[10px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={14} strokeWidth={3} />
            Anterior
          </button>
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-100 bg-white text-[10px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Siguiente
            <ChevronRight size={14} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}
