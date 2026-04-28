import React, { useState, useEffect } from 'react';
import { Package, Plus, Layers, Info, BookOpen } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { apiService } from '../../services/apiService';
import { PaqueteMaestro } from '../../types';

interface CatalogoPaquetesProps {
  currentUser: any;
}

export default function CatalogoPaquetes({ currentUser }: CatalogoPaquetesProps) {
  const [paquetes, setPaquetes] = useState<PaqueteMaestro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPaquete, setEditingPaquete] = useState<PaqueteMaestro | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<PaqueteMaestro>>({
    nombre: '',
    cantCitas: 12,
    precioSugerido: 0,
    frecuencia: 'SEMANAL',
    limiteEspecialidades: 1
  });

  const loadPaquetes = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getPaquetesMaestros();
      setPaquetes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPaquetes();
  }, []);

  const handleAdd = () => {
    setEditingPaquete(null);
    setFormData({
      nombre: '',
      cantCitas: 12,
      precioSugerido: 0,
      frecuencia: 'SEMANAL',
      limiteEspecialidades: 1
    });
    setIsModalOpen(true);
  };

  const handleEdit = (paquete: PaqueteMaestro) => {
    setEditingPaquete(paquete);
    setFormData(paquete);
    setIsModalOpen(true);
  };

  const handleDelete = async (paquete: PaqueteMaestro) => {
    await apiService.deletePaqueteMaestro(paquete.id, currentUser.nombreUsuario);
    loadPaquetes();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (editingPaquete) {
        await apiService.updatePaqueteMaestro(editingPaquete.id, formData, currentUser.nombreUsuario);
      } else {
        await apiService.createPaqueteMaestro(formData as Omit<PaqueteMaestro, 'id'>, currentUser.nombreUsuario);
      }
      setIsModalOpen(false);
      loadPaquetes();
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const columns = [
    { 
      header: 'Nombre del Paquete', 
      accessor: (p: PaqueteMaestro) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="font-bold text-slate-900 leading-tight">{p.nombre}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Molde Maestro</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Sesiones', 
      accessor: (p: PaqueteMaestro) => (
        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider">
          {p.cantCitas} Citas
        </span>
      )
    },
    { 
      header: 'Precio Sugerido', 
      accessor: (p: PaqueteMaestro) => (
        <span className="font-black text-slate-900">
          S/ {p.precioSugerido.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
        </span>
      )
    },
    { 
      header: 'Frecuencia', 
      accessor: (p: PaqueteMaestro) => (
        <span className="text-sm font-medium text-slate-600 capitalize">{p.frecuencia.toLowerCase()}</span>
      )
    },
    { 
      header: 'Esp. Max', 
      accessor: (p: PaqueteMaestro) => (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg border border-amber-100/50">
          <Layers size={14} />
          <span className="text-xs font-bold">{p.limiteEspecialidades}</span>
        </div>
      )
    }
  ];

  return (
    <div className="clini-animate-fade space-y-8 pb-10">
      <div className="clini-page-header">
        <div>
          <h2 className="clini-title-main font-black">Catálogo de Paquetes</h2>
          <p className="clini-subtitle">Define los moldes comerciales para la venta de sesiones.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-warning/5 text-warning rounded-2xl border border-warning/10">
            <Info size={16} />
            <span className="text-[10px] font-black uppercase tracking-wider leading-none">Los cambios no afectan a ventas ya realizadas</span>
          </div>
        </div>
      </div>

      <DataTable
        title="Plantillas Maestras"
        data={paquetes}
        columns={columns as any}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        searchPlaceholder="Buscar plantilla..."
        searchFields={['nombre']}
      />

      {/* Modal CRUD Maestros */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[var(--sys-radius-3xl)] shadow-2xl shadow-slate-900/20 w-full max-w-lg overflow-hidden border border-slate-100 animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <Plus size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {editingPaquete ? 'Editar Plantilla' : 'Nueva Plantilla Maestro'}
                  </h3>
                  <p className="text-sm text-slate-500">Mapea la oferta comercial del centro.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="clini-form-group">
                  <label className="clini-label-form">Nombre Comercial del Paquete</label>
                  <input
                    required
                    type="text"
                    className="input-field"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Plan Bienestar 12"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="clini-form-group">
                    <label className="clini-label-form">Cantidad de Citas</label>
                    <input
                      required
                      type="number"
                      className="input-field"
                      value={formData.cantCitas}
                      onChange={(e) => setFormData({ ...formData, cantCitas: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="clini-form-group">
                    <label className="clini-label-form">Precio Sugerido (S/)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      className="input-field font-black text-primary"
                      value={formData.precioSugerido}
                      onChange={(e) => setFormData({ ...formData, precioSugerido: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="clini-form-group">
                    <label className="clini-label-form">Frecuencia Habitual</label>
                    <select
                      className="input-field"
                      value={formData.frecuencia}
                      onChange={(e) => setFormData({ ...formData, frecuencia: e.target.value as any })}
                    >
                      <option value="SEMANAL">Semanal</option>
                      <option value="QUINCENAL">Quincenal</option>
                      <option value="MENSUAL">Mensual</option>
                    </select>
                  </div>
                  <div className="clini-form-group">
                    <label className="clini-label-form">Límite de Esp.</label>
                    <input
                      required
                      type="number"
                      className="input-field"
                      value={formData.limiteEspecialidades}
                      onChange={(e) => setFormData({ ...formData, limiteEspecialidades: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="clini-form-actions pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                  disabled={isProcessing}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Procesando...' : editingPaquete ? 'Actualizar Plantilla' : 'Guardar Plantilla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
