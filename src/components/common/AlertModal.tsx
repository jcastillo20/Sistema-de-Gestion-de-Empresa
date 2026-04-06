import React from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'error' | 'success' | 'warning';
  onConfirm?: () => void;
}

export function AlertModal({ isOpen, onClose, title, message, type = 'error', onConfirm }: AlertModalProps) {
  const colors = {
    error: 'text-red-600 bg-red-50 border-red-100',
    success: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    warning: 'text-amber-600 bg-amber-50 border-amber-100',
  };

  const icons = {
    error: AlertCircle,
    success: CheckCircle2,
    warning: AlertCircle,
  };

  const Icon = icons[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden p-8 text-center"
          >
            <div className={cn("mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 border", colors[type])}>
              <Icon size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 mb-6">{message}</p>
            
            <div className="flex flex-col gap-2">
              {onConfirm ? (
                <>
                  <button
                    onClick={onConfirm}
                    className={cn(
                      "w-full py-3 rounded-xl font-semibold transition-all text-white",
                      type === 'error' ? "bg-red-600 hover:bg-red-700" : 
                      type === 'success' ? "bg-emerald-600 hover:bg-emerald-700" :
                      "bg-amber-600 hover:bg-amber-700"
                    )}
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-3 rounded-xl font-semibold transition-all text-slate-600 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  onClick={onClose}
                  className={cn(
                    "w-full py-3 rounded-xl font-semibold transition-all text-white",
                    type === 'error' ? "bg-red-600 hover:bg-red-700" : 
                    type === 'success' ? "bg-emerald-600 hover:bg-emerald-700" :
                    "bg-amber-600 hover:bg-amber-700"
                  )}
                >
                  Entendido
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
