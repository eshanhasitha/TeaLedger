import { useMemo } from 'react';
import { useDashboard } from './useDashboard';
import type { TeaCollector, CollectorStats } from '../types/collector.types';

export const useCollectors = () => {
  const {
    collectors,
    addCollector,
    updateCollectorStatus,
    isAddCollectorModalOpen,
    setIsAddCollectorModalOpen,
    selectedCollectorForDetail,
    setSelectedCollectorForDetail,
  } = useDashboard();

  const stats: CollectorStats = useMemo(() => {
    const totalCollectors = collectors.length;
    const activeToday = collectors.filter((c: TeaCollector) => c.status === 'Active').length;
    const todayIntakeKg = collectors.reduce((sum: number, c: TeaCollector) => sum + c.todayIntakeKg, 0);
    const onLeave = collectors.filter((c: TeaCollector) => c.status === 'On Leave').length;

    return {
      totalCollectors,
      activeToday,
      todayIntakeKg,
      onLeave,
    };
  }, [collectors]);

  return {
    collectors,
    stats,
    addCollector,
    updateCollectorStatus,
    isAddCollectorModalOpen,
    setIsAddCollectorModalOpen,
    selectedCollectorForDetail,
    setSelectedCollectorForDetail,
  };
};
