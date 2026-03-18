import { AlertData } from '../types';

export const OPERATIONAL_ALERTS: AlertData[] = [
  {
    id: 'overtime-surge',
    title: 'Overtime Surge',
    theme: 'orange',
    iconName: 'Clock',
    metric: {
      value: '+12.4%',
      trend: '+12.4%',
      status: 'critical',
      subtitle: 'North Zone • Emergency',
    },
  },
  {
    id: 'sick-leave',
    title: 'Sick Leave Spike',
    theme: 'orange',
    iconName: 'Activity',
    metric: {
      value: '+8.5%',
      trend: '+8.5%',
      status: 'warning',
      subtitle: 'All Zones • Viral',
    },
  },
  {
    id: 'nursing-vacancy',
    title: 'Nursing Vacancy',
    theme: 'purple',
    iconName: 'UserMinus',
    metric: {
      value: '142 FTE',
      status: 'warning',
      subtitle: 'Rural • Recruitment',
    },
  },
  {
    id: 'key-attrition',
    title: 'Key Attrition',
    theme: 'green',
    iconName: 'TrendingDown',
    metric: {
      value: 'High',
      status: 'good',
      subtitle: 'Clinical Ops Leadership',
    },
  },
];

export const EXECUTIVE_BRIEFINGS = [
  {
    id: 'overtime',
    title: 'Workforce Stability Risk',
    type: 'CRITICAL',
    content: 'Combined Overtime & Sick Leave in North Zone suggests imminent burnout.',
  },
  {
    id: 'recruitment',
    title: 'Hiring Velocity Drop',
    type: 'WARNING',
    content: 'Credentialing bottleneck causing 15% increase in time-to-fill.',
  },
];

export const REPORT_DATA: Record<string, {
  summary: string;
  keyFactors: string[];
  recommendation: string;
  kpis?: { label: string; value: string; change: string; status: 'good' | 'warning' | 'critical' }[];
  chartData?: { label: string; value: number; target?: number }[];
  tableData?: { label: string; current: string; previous: string; change: string }[];
}> = {
  'executive-summary': {
    summary:
      'Workforce stability metrics indicate a critical variance in overtime usage across the North Zone, driven primarily by vacancies in acute care. However, retention initiatives in the South Zone have yielded a 4% improvement in quarterly attrition rates.',
    keyFactors: [
      'Risk: Sick leave utilization is tracking 12% above forecast for Q2.',
      'Opportunity: New hire velocity has increased by 15% following process optimization.',
    ],
    recommendation: 'Immediate intervention required for North Zone staffing levels.',
    kpis: [
      { label: 'Total Headcount', value: '112,500', change: '+2.1%', status: 'good' },
      { label: 'Overtime Rate', value: '12.4%', change: '+3.2%', status: 'critical' },
      { label: 'Attrition Rate', value: '8.7%', change: '-0.4%', status: 'good' },
      { label: 'Vacancy Rate', value: '5.2%', change: '+1.1%', status: 'warning' },
    ],
  },
  overtime: {
    summary:
      'Overtime expenditure for FY 2026 has reached $12.4M, representing an 8.2% increase over the previous fiscal year.',
    keyFactors: [
      'Emergency Dept has 23% of staff exceeding 60hr/week for 4+ consecutive weeks.',
      'OT spend increased 15% YoY while productivity metrics remain flat.',
    ],
    recommendation: 'Implement mandatory rest periods and review scheduling algorithms.',
    kpis: [
      { label: 'Total OT Cost', value: '$12.4M', change: '+8.2%', status: 'critical' },
      { label: 'Avg OT/Employee', value: '6.2 hrs/wk', change: '-2.1%', status: 'good' },
      { label: 'High-Risk Units', value: '14', change: '+3', status: 'critical' },
      { label: 'Budget Variance', value: '-$1.8M', change: 'Over Budget', status: 'warning' },
    ],
  },
  attrition: {
    summary:
      'Overall attrition for FY 2026 stands at 8.7%, a marginal improvement from 9.1% in FY 2025.',
    keyFactors: [
      'Clinical leadership roles show elevated voluntary turnover at 15.2%.',
      'South Zone retention initiatives reduced attrition by 4% this quarter.',
    ],
    recommendation: 'Expand South Zone retention program to Central and North Zones.',
    kpis: [
      { label: 'Overall Attrition', value: '8.7%', change: '-0.4%', status: 'good' },
      { label: 'Voluntary Turnover', value: '6.1%', change: '+0.8%', status: 'warning' },
      { label: 'Critical Role Loss', value: '12 FTE', change: '+4', status: 'critical' },
      { label: 'Retention Rate', value: '91.3%', change: '+0.4%', status: 'good' },
    ],
  },
};
