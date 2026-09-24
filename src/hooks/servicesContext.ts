import { createContext, useContext } from 'react';
import type { AppServices } from '../services/AppServices';

export const ServicesContext = createContext<AppServices | null>(null);

export function useServices(): AppServices {
  const services = useContext(ServicesContext);
  if (!services) {
    throw new Error('useServices, ServicesProvider dışında kullanılamaz');
  }
  return services;
}
