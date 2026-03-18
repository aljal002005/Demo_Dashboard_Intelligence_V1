import React from 'react';
import { DashboardGrid } from './DashboardGrid';
import { DashboardItem } from '../types';

interface AnalyticsViewProps {
  onItemClick: (item: DashboardItem) => void;
  isDarkMode?: boolean;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onItemClick, isDarkMode }) => (
  <DashboardGrid
    onItemClick={onItemClick}
    title="Executive View"
    description="Click any metric to explore deep-dive analytics, trend benchmarks, and AI-generated insights."
    isDarkMode={isDarkMode}
  />
);
