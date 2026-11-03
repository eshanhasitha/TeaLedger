import { createContext } from 'react';
import type { DashboardContextType } from '../types/dashboard.types';

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

