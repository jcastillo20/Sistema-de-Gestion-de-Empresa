import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface Option {
  value: string | number;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
  icon?: React.ReactNode;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  className,
  disabled = false,
  error,
  icon
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm('');
    }
  };

  const handleSelect = (val: string | number) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <div
        onClick={handleToggle}
        className={cn(
          "clini-input-group flex items-center justify-between cursor-pointer transition-all duration-200",
          icon ? "clini-input-field-icon-left h-fit" : "input-field h-fit",
          isOpen && "ring-2 ring-primary/20 border-primary shadow-sys-sm",
          disabled && "opacity-70 cursor-not-allowed",
          error && "border-danger ring-danger/20"
        )}
      >
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        <div className="flex items-center gap-3 truncate w-full">
          <span className={cn(
            "text-[14px] truncate",
            !selectedOption ? "text-slate-400 font-medium" : "text-slate-900 font-bold"
          )}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <div className="shrink-0 flex items-center">
          <ChevronDown 
            size={18} 
            className={cn(
              "text-slate-400 transition-transform duration-200",
              isOpen && "rotate-180 text-primary"
            )} 
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[100] mt-2 w-full bg-white border border-border rounded-xl shadow-sys-lg p-2 animate-in fade-in zoom-in-95 duration-100">
          <div className="relative mb-2">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={14} />
            </div>
            <input
              ref={inputRef}
              type="text"
              className="clini-security-search-input !w-full !max-w-full"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(opt.value);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[13px] font-bold cursor-pointer transition-colors",
                    value === opt.value 
                      ? "bg-primary text-white" 
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-[12px] text-slate-400 font-medium italic">
                No se encontraron resultados
              </div>
            )}
          </div>
        </div>
      )}
      
      {error && <p className="text-xs text-danger mt-1 font-bold">{error}</p>}
    </div>
  );
}
