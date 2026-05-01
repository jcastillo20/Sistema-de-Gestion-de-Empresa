import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ExportButtonProps {
  onExcel: () => void;
  onPdf: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
  label?: string;
  showLabel?: boolean;
}

export function ExportButton({ 
  onExcel, 
  onPdf, 
  className, 
  variant = 'secondary', 
  label = 'Descargar',
  showLabel = true 
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={!showLabel ? label : undefined}
        className={cn(
          "flex items-center justify-center gap-2 rounded-2xl transition-all active:scale-95",
          showLabel ? "px-4 py-2.5 text-[10px] font-black uppercase tracking-widest" : "p-2.5",
          variant === 'primary' ? "btn-primary shadow-lg shadow-primary/20" : "bg-white border border-slate-100 text-slate-500 hover:bg-slate-50",
          className
        )}
      >
        <Download size={showLabel ? 16 : 18} />
        {showLabel && <span className="hidden md:inline">{label}</span>}
        {showLabel && <ChevronDown size={14} className={cn("transition-transform duration-300", isOpen && "rotate-180")} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-52 bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 py-3 z-[100] overflow-hidden"
          >
            <button
              onClick={() => {
                onExcel();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm">
                <FileSpreadsheet size={18} />
              </div>
              <div className="flex flex-col">
                <span>Excel</span>
                <span className="text-[8px] opacity-50 lowercase tracking-normal">Hoja de cálculo</span>
              </div>
            </button>
            <button
              onClick={() => {
                onPdf();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-sm">
                <FileText size={18} />
              </div>
              <div className="flex flex-col">
                <span>PDF</span>
                <span className="text-[8px] opacity-50 lowercase tracking-normal">Documento de lectura</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
