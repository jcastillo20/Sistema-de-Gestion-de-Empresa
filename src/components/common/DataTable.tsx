import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown,
  Filter,
  Download
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { AlertModal } from './AlertModal';

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
  searchFields
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: '',
    direction: null
  });

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
          : Object.values(item).map(v => String(v || '').toLowerCase());
        
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
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
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
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500">Total: {data.length} registros</p>
          </div>
          <div className="flex items-center gap-3">
            {onAdd && (
              <button 
                onClick={onAdd}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-primary/20"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Nuevo</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
              <Filter size={18} />
            </button>
            <button className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              {columns.map((column, idx) => (
                <th 
                  key={idx} 
                  className={cn(
                    "px-4 sm:px-6 py-4 whitespace-nowrap",
                    column.sortable && "cursor-pointer hover:text-primary transition-colors",
                    column.className
                  )}
                  onClick={() => column.sortable && column.sortKey && handleSort(column.sortKey as string)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && (
                      <span className="text-slate-300">
                        {sortConfig.key === column.sortKey ? (
                          sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ChevronsUpDown size={14} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {(onEdit || onDelete || customActions) && <th className="px-4 sm:px-6 py-4 text-right min-w-[100px] sm:min-w-[120px]">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                </td>
              </tr>
            ) : filteredAndSortedData.length > 0 ? (
              filteredAndSortedData.map((item, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-50/50 transition-colors group">
                  {columns.map((column, colIdx) => (
                    <td key={colIdx} className={cn("px-4 sm:px-6 py-4 text-sm text-slate-600", column.className)}>
                      {typeof column.accessor === 'function' 
                        ? column.accessor(item) 
                        : (item[column.accessor] as any)}
                    </td>
                  ))}
                  {(onEdit || onDelete || customActions) && (
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        {customActions && customActions(item)}
                        {onEdit && (
                          <button 
                            onClick={() => onEdit(item)}
                            className="p-2 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors active:scale-95"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                        {onDelete && (
                          <button 
                            onClick={() => handleDeleteClick(item)}
                            className="p-2 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors active:scale-95"
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
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <Search size={48} strokeWidth={1} />
                    <p className="text-lg font-medium">No se encontraron resultados</p>
                    <p className="text-sm">Intenta con otros términos de búsqueda</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between text-xs text-slate-500">
        <p>Mostrando {filteredAndSortedData.length} de {data.length} registros</p>
        <div className="flex items-center gap-2">
          <button disabled className="px-3 py-1 rounded-lg border border-slate-200 bg-white disabled:opacity-50">Anterior</button>
          <button disabled className="px-3 py-1 rounded-lg border border-slate-200 bg-white disabled:opacity-50">Siguiente</button>
        </div>
      </div>
    </div>
  );
}
