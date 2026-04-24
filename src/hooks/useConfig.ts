import { useState, useEffect, useMemo, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { ConfiguracionDinamica, Especialidad, Sede } from '../types';

export function useConfig() {
  const [configs, setConfigs] = useState<ConfiguracionDinamica[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const [configData, sedesData, specsData] = await Promise.all([
        apiService.getConfiguracion(),
        apiService.getSedes(),
        apiService.getEspecialidades()
      ]);
      setConfigs(configData);
      setSedes(sedesData);
      setEspecialidades(specsData);
    } catch (error) {
      console.error('Error loading configuration:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
    window.addEventListener('configUpdated', loadConfig);
    return () => window.removeEventListener('configUpdated', loadConfig);
  }, [loadConfig]);

  const getDictionary = useCallback((prefix: string) => {
    return configs
      .filter(c => c.clave.startsWith(prefix) && c.valor !== false)
      .sort((a, b) => a.orden - b.orden);
  }, [configs]);

  const getLabel = useCallback((prefix: string, value: string) => {
    const item = configs.find(c => c.clave.startsWith(prefix) && c.valor === value);
    return item ? item.etiqueta : value;
  }, [configs]);

  const agendaConfig = useMemo(() => {
    return configs
      .filter(c => c.categoria === 'AGENDA')
      .reduce((acc, curr) => {
        acc[curr.clave] = curr.valor;
        return acc;
      }, {} as Record<string, any>);
  }, [configs]);

  const brandingConfig = useMemo(() => {
    return configs
      .filter(c => c.categoria === 'BRANDING')
      .reduce((acc, curr) => {
        acc[curr.clave] = curr.valor;
        return acc;
      }, {} as Record<string, any>);
  }, [configs]);

  return {
    configs,
    sedes,
    especialidades,
    isLoading,
    getDictionary,
    getLabel,
    agendaConfig,
    brandingConfig,
    refresh: loadConfig
  };
}
