import { DashboardItem } from './types';

export const DASHBOARD_ITEMS: DashboardItem[] = [
  { id: 'overtime', title: 'Overtime Hours', theme: 'orange', iconName: 'Clock' },
  { id: 'sick-leave', title: 'Sick Leave', theme: 'orange', iconName: 'Activity' },
  { id: 'scheduling', title: 'Scheduling Compliance', theme: 'orange', iconName: 'CalendarCheck' },
  { id: 'safety', title: 'Safety Incidents', theme: 'orange', iconName: 'ShieldAlert' },
  { id: 'headcount', title: 'Total Headcount', theme: 'green', iconName: 'Users' },
  { id: 'vacancies', title: 'Vacancies & Recruitment', theme: 'green', iconName: 'UserPlus' },
  { id: 'attrition', title: 'Attrition Rate', theme: 'green', iconName: 'TrendingDown' },
  { id: 'engagement', title: 'Employee Engagement', theme: 'green', iconName: 'Heart' },
  { id: 'time-to-fill', title: 'Time to Fill', theme: 'purple', iconName: 'Timer' },
  { id: 'credentialing', title: 'Credentialing Status', theme: 'purple', iconName: 'BadgeCheck' },
  { id: 'succession', title: 'Succession Planning', theme: 'purple', iconName: 'GitFork' },
  { id: 'learning', title: 'Learning & Development', theme: 'purple', iconName: 'BookOpen' },
];

export const ORG_NAME = 'HSS Health Network';
