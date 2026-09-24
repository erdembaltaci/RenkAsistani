import type { ReactNode } from 'react';
import type { AppServices } from '../services/AppServices';
import { ServicesContext } from './servicesContext';

interface ServicesProviderProps {
  services: AppServices;
  children: ReactNode;
}

export function ServicesProvider({ services, children }: ServicesProviderProps) {
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}
