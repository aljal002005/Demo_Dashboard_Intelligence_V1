import { AlertData } from '../types';

export const OPERATIONAL_ALERTS: AlertData[] = [
  {
    id: 'overtime-surge',
    title: 'Overtime Surge',
    theme: 'orange',
    iconName: 'Clock',
    metric: { value: '+12.4%', trend: '+12.4%', status: 'critical', subtitle: 'North Zone • Emergency' },
  },
  {
    id: 'sick-leave',
    title: 'Sick Leave Spike',
    theme: 'orange',
    iconName: 'Activity',
    metric: { value: '+8.5%', trend: '+8.5%', status: 'warning', subtitle: 'All Zones • Viral' },
  },
  {
    id: 'nursing-vacancy',
    title: 'Nursing Vacancy',
    theme: 'purple',
    iconName: 'UserMinus',
    metric: { value: '142 FTE', status: 'warning', subtitle: 'Rural • Recruitment' },
  },
  {
    id: 'key-attrition',
    title: 'Key Attrition',
    theme: 'green',
    iconName: 'TrendingDown',
    metric: { value: 'High', status: 'good', subtitle: 'Clinical Ops Leadership' },
  },
];

export const EXECUTIVE_BRIEFINGS = [
  { id: 'overtime', title: 'Workforce Stability Risk', type: 'CRITICAL', content: 'Combined Overtime & Sick Leave in North Zone suggests imminent burnout.' },
  { id: 'recruitment', title: 'Hiring Velocity Drop', type: 'WARNING', content: 'Credentialing bottleneck causing 15% increase in time-to-fill.' },
];

export const REPORT_DATA: Record<string, {
  summary: string;
  keyFactors: string[];
  recommendation: string;
  kpis?: { label: string; value: string; change: string; status: 'good' | 'warning' | 'critical' }[];
  chartData?: { label: string; value: number; target?: number; previous?: number }[];
  tableData?: { label: string; current: string; previous: string; change: string; status?: 'good' | 'warning' | 'critical' }[];
}> = {

  'executive-summary': {
    summary: 'Workforce stability metrics indicate a critical variance in overtime usage across the North Zone, driven primarily by vacancies in acute care. However, retention initiatives in the South Zone have yielded a 4% improvement in quarterly attrition rates. Credentialing compliance continues to lag in rural communities, impacting time-to-fill.',
    keyFactors: [
      'Risk: Sick leave utilization is tracking 12% above forecast for Q2, concentrated in Emergency and ICU.',
      'Risk: 142 open nursing FTE positions are inflating overtime spend by an estimated $3.1M annualized.',
      'Opportunity: New hire velocity has increased by 15% following process optimization in Calgary and Edmonton.',
      'Opportunity: Employee engagement scores improved +5 points to 72/100 following the Q3 wellness initiative.',
    ],
    recommendation: 'Immediate intervention required for North Zone staffing levels. Prioritize agency nurse contracts for Emergency and ICU through Q1, while accelerating the rural credentialing intake process to reduce time-to-fill below the 45-day target.',
    kpis: [
      { label: 'Total Headcount', value: '112,500', change: '+2.1%', status: 'good' },
      { label: 'Overtime Rate', value: '12.4%', change: '+3.2%', status: 'critical' },
      { label: 'Attrition Rate', value: '8.7%', change: '-0.4%', status: 'good' },
      { label: 'Vacancy Rate', value: '5.2%', change: '+1.1%', status: 'warning' },
    ],
    chartData: [
      { label: 'Q1 FY25', value: 8.1, target: 8.5, previous: 9.2 },
      { label: 'Q2 FY25', value: 8.4, target: 8.5, previous: 9.1 },
      { label: 'Q3 FY25', value: 9.1, target: 8.5, previous: 9.0 },
      { label: 'Q4 FY25', value: 9.3, target: 8.5, previous: 8.8 },
      { label: 'Q1 FY26', value: 8.7, target: 8.5, previous: 8.1 },
      { label: 'Q2 FY26', value: 8.9, target: 8.5, previous: 8.4 },
    ],
    tableData: [
      { label: 'Overtime Rate', current: '12.4%', previous: '10.9%', change: '+1.5%', status: 'critical' },
      { label: 'Attrition Rate', current: '8.7%', previous: '9.1%', change: '-0.4%', status: 'good' },
      { label: 'Vacancy Rate', current: '5.2%', previous: '4.1%', change: '+1.1%', status: 'warning' },
      { label: 'Engagement Score', current: '72/100', previous: '67/100', change: '+5 pts', status: 'good' },
      { label: 'Time to Fill', current: '42 days', previous: '45 days', change: '-3 days', status: 'good' },
      { label: 'Credentialing', current: '89.3%', previous: '87.2%', change: '+2.1%', status: 'good' },
    ],
  },

  overtime: {
    summary: 'Overtime hours for FY 2026 YTD total 2.08 million hours, representing a 2.9% overtime rate against total paid hours. This is a 12.4% increase versus the same period last year, with overtime expenditure reaching $12.4M — $1.8M over the approved budget. The North Zone Emergency and ICU departments account for 65% of total overage.',
    keyFactors: [
      'Risk: Emergency Dept has 23% of staff exceeding 60 hours/week for 4+ consecutive weeks, creating burnout risk.',
      'Risk: 142 open nursing FTE positions are the primary driver — each vacancy generates an estimated $22,000/year in incremental OT.',
      'Risk: OT spend increased 15% YoY while productivity metrics (patient outcomes, discharge rates) remain flat.',
      'Opportunity: South Zone implemented self-scheduling in Q2, reducing OT by 8% in that zone.',
    ],
    recommendation: 'Implement mandatory rest periods of 11 hours between shifts for staff exceeding 48 hours/week. Engage locum and agency nurses for the North Zone for the next 8 weeks while accelerating permanent recruitment. Review scheduling algorithm in clinical wards to distribute workload more equitably.',
    kpis: [
      { label: 'Total OT Hours', value: '2.08M', change: '+12.4%', status: 'critical' },
      { label: 'OT Cost YTD', value: '$12.4M', change: '+8.2%', status: 'critical' },
      { label: 'High-Risk Units', value: '14', change: '+3 units', status: 'warning' },
      { label: 'Budget Variance', value: '-$1.8M', change: 'Over Budget', status: 'critical' },
    ],
    chartData: [
      { label: 'Apr', value: 2.4, target: 2.0, previous: 2.1 },
      { label: 'May', value: 2.7, target: 2.0, previous: 2.3 },
      { label: 'Jun', value: 2.8, target: 2.0, previous: 2.2 },
      { label: 'Jul', value: 3.2, target: 2.0, previous: 2.4 },
      { label: 'Aug', value: 3.1, target: 2.0, previous: 2.5 },
      { label: 'Sep', value: 2.9, target: 2.0, previous: 2.3 },
      { label: 'Oct', value: 2.8, target: 2.0, previous: 2.4 },
      { label: 'Nov', value: 2.8, target: 2.0, previous: 2.6 },
      { label: 'Dec', value: 3.1, target: 2.0, previous: 2.8 },
    ],
    tableData: [
      { label: 'UNA (Nursing)', current: '1,250,375 hrs', previous: '1,089,000 hrs', change: '+14.8%', status: 'critical' },
      { label: 'AUPE GSS', current: '474,549 hrs', previous: '430,100 hrs', change: '+10.3%', status: 'warning' },
      { label: 'HSAA', current: '181,637 hrs', previous: '172,000 hrs', change: '+5.6%', status: 'warning' },
      { label: 'AUPE AUX', current: '137,173 hrs', previous: '128,500 hrs', change: '+6.7%', status: 'warning' },
      { label: 'NUEE', current: '22,381 hrs', previous: '21,000 hrs', change: '+6.6%', status: 'good' },
      { label: 'PARA', current: '14,285 hrs', previous: '14,000 hrs', change: '+2.0%', status: 'good' },
    ],
  },

  'sick-leave': {
    summary: 'Sick leave utilization for FY 2026 YTD stands at 8.5% of total scheduled hours, representing a 2.1 percentage point increase over the same period last year. The spike is concentrated in Q3, driven primarily by viral respiratory illness affecting Emergency and General Medicine wards. Total sick leave hours have reached 890,000 YTD, adding an estimated $6.2M in replacement costs.',
    keyFactors: [
      'Risk: Q3 viral season drove a 28% spike in sick leave in Emergency and General Medicine departments.',
      'Risk: Chronic sick leave (>10 consecutive days) increased 18% YoY, suggesting underlying wellness issues.',
      'Risk: North and Edmonton zones show the highest rates at 10.2% and 9.8% respectively.',
      'Opportunity: South Zone proactive wellness program has kept sick leave at 6.1%, 2.4% below the system average.',
    ],
    recommendation: 'Extend the South Zone wellness screening program system-wide. Implement early intervention for staff with 3+ sick leave occurrences in a rolling 90-day window. Consider mandatory return-to-work interviews to distinguish acute illness from systemic burnout.',
    kpis: [
      { label: 'YTD Sick Leave Rate', value: '8.5%', change: '+2.1%', status: 'critical' },
      { label: 'Total Sick Hours', value: '890K hrs', change: '+18.3%', status: 'critical' },
      { label: 'Replacement Cost', value: '$6.2M', change: '+22.4%', status: 'critical' },
      { label: 'Chronic SL Cases', value: '312', change: '+18%', status: 'warning' },
    ],
    chartData: [
      { label: 'Apr', value: 6.8, target: 6.5, previous: 6.2 },
      { label: 'May', value: 7.1, target: 6.5, previous: 6.4 },
      { label: 'Jun', value: 7.4, target: 6.5, previous: 6.5 },
      { label: 'Jul', value: 9.2, target: 6.5, previous: 7.1 },
      { label: 'Aug', value: 10.1, target: 6.5, previous: 7.3 },
      { label: 'Sep', value: 9.8, target: 6.5, previous: 6.9 },
      { label: 'Oct', value: 8.5, target: 6.5, previous: 6.6 },
      { label: 'Nov', value: 8.2, target: 6.5, previous: 6.4 },
      { label: 'Dec', value: 8.5, target: 6.5, previous: 6.5 },
    ],
    tableData: [
      { label: 'Calgary Zone', current: '7.8%', previous: '6.1%', change: '+1.7%', status: 'warning' },
      { label: 'Edmonton Zone', current: '9.8%', previous: '7.4%', change: '+2.4%', status: 'critical' },
      { label: 'Central Zone', current: '8.1%', previous: '6.8%', change: '+1.3%', status: 'warning' },
      { label: 'North Zone', current: '10.2%', previous: '7.9%', change: '+2.3%', status: 'critical' },
      { label: 'South Zone', current: '6.1%', previous: '5.9%', change: '+0.2%', status: 'good' },
    ],
  },

  scheduling: {
    summary: 'Scheduling compliance for FY 2026 YTD sits at 94.2%, a 1.8 percentage point improvement over the prior year. This reflects the successful rollout of the self-scheduling module in Calgary and Edmonton Zones. Remaining gaps are concentrated in specialized units (ICU, OR) where skill-matching constraints limit schedule flexibility.',
    keyFactors: [
      'Opportunity: Calgary Zone achieved 97.1% compliance following self-scheduling implementation in Q2.',
      'Opportunity: Unfilled shift rate dropped from 8.4% to 5.8% system-wide following the new scheduling platform.',
      'Risk: ICU and OR units remain at 88.2% compliance due to limited pool of qualified float staff.',
      'Risk: Holiday period (Dec–Jan) saw compliance dip to 90.1%, requiring 340 mandatory OT assignments.',
    ],
    recommendation: 'Expand self-scheduling to remaining zones by end of Q2. Build a dedicated ICU/OR float pool with minimum 25 qualified staff per zone to address specialized unit shortfalls. Review holiday staffing model to reduce mandatory OT during peak periods.',
    kpis: [
      { label: 'Compliance Rate', value: '94.2%', change: '+1.8%', status: 'good' },
      { label: 'Unfilled Shifts', value: '5.8%', change: '-2.6%', status: 'good' },
      { label: 'Mandatory OT Shifts', value: '1,240', change: '-15%', status: 'good' },
      { label: 'ICU/OR Compliance', value: '88.2%', change: '-0.4%', status: 'warning' },
    ],
    chartData: [
      { label: 'Apr', value: 91.2, target: 95.0, previous: 89.8 },
      { label: 'May', value: 92.4, target: 95.0, previous: 90.5 },
      { label: 'Jun', value: 93.1, target: 95.0, previous: 91.2 },
      { label: 'Jul', value: 94.8, target: 95.0, previous: 92.4 },
      { label: 'Aug', value: 95.2, target: 95.0, previous: 92.1 },
      { label: 'Sep', value: 94.9, target: 95.0, previous: 91.8 },
      { label: 'Oct', value: 95.1, target: 95.0, previous: 92.5 },
      { label: 'Nov', value: 94.5, target: 95.0, previous: 92.4 },
      { label: 'Dec', value: 90.1, target: 95.0, previous: 89.5 },
    ],
    tableData: [
      { label: 'Calgary Zone', current: '97.1%', previous: '93.2%', change: '+3.9%', status: 'good' },
      { label: 'Edmonton Zone', current: '95.4%', previous: '92.1%', change: '+3.3%', status: 'good' },
      { label: 'Central Zone', current: '93.8%', previous: '92.4%', change: '+1.4%', status: 'good' },
      { label: 'North Zone', current: '90.4%', previous: '90.1%', change: '+0.3%', status: 'warning' },
      { label: 'South Zone', current: '94.2%', previous: '93.0%', change: '+1.2%', status: 'good' },
      { label: 'ICU / OR (All Zones)', current: '88.2%', previous: '88.6%', change: '-0.4%', status: 'warning' },
    ],
  },

  safety: {
    summary: 'Safety incidents for FY 2026 YTD total 3 critical events and 18 minor incidents, representing a 40% reduction in critical events compared to FY 2025. This improvement is attributed to the mandatory safety huddle program launched in Q1 and upgraded personal protective equipment in high-risk areas. Lost-time injury frequency has fallen below the provincial benchmark for the first time.',
    keyFactors: [
      'Opportunity: Critical incident count reduced 40% YoY following mandatory safety huddle implementation.',
      'Opportunity: Lost-time injury rate fell to 1.2/100 FTE, below the provincial benchmark of 1.5/100 FTE.',
      'Risk: North Zone still accounts for 42% of all incidents despite having only 9% of headcount.',
      'Risk: Needle-stick injuries remain elevated in Emergency, representing 35% of all minor incidents.',
    ],
    recommendation: 'Deploy targeted needle-stick prevention protocol in Emergency departments across all zones. Investigate root cause of North Zone concentration and consider a dedicated safety advisor for that zone. Expand the safety huddle model to include weekly near-miss reporting.',
    kpis: [
      { label: 'Critical Incidents', value: '3', change: '-40%', status: 'good' },
      { label: 'Minor Incidents', value: '18', change: '-22%', status: 'good' },
      { label: 'Lost-Time Rate', value: '1.2/100', change: '-0.3', status: 'good' },
      { label: 'Days Lost YTD', value: '124', change: '-38%', status: 'good' },
    ],
    chartData: [
      { label: 'Apr', value: 4, target: 3, previous: 6 },
      { label: 'May', value: 5, target: 3, previous: 7 },
      { label: 'Jun', value: 3, target: 3, previous: 6 },
      { label: 'Jul', value: 2, target: 3, previous: 5 },
      { label: 'Aug', value: 1, target: 3, previous: 4 },
      { label: 'Sep', value: 2, target: 3, previous: 5 },
      { label: 'Oct', value: 1, target: 3, previous: 4 },
      { label: 'Nov', value: 2, target: 3, previous: 3 },
      { label: 'Dec', value: 1, target: 3, previous: 5 },
    ],
    tableData: [
      { label: 'Calgary Zone', current: '4 incidents', previous: '8 incidents', change: '-50%', status: 'good' },
      { label: 'Edmonton Zone', current: '6 incidents', previous: '9 incidents', change: '-33%', status: 'good' },
      { label: 'North Zone', current: '9 incidents', previous: '12 incidents', change: '-25%', status: 'warning' },
      { label: 'Central Zone', current: '1 incident', previous: '3 incidents', change: '-67%', status: 'good' },
      { label: 'South Zone', current: '1 incident', previous: '2 incidents', change: '-50%', status: 'good' },
    ],
  },

  headcount: {
    summary: 'Total headcount stands at 112,500 FTE as of the reporting period, a 2.1% increase year-over-year. Growth is concentrated in Clinical Operations (+3.2%) driven by expansion of acute care capacity in Calgary. Administrative functions show a planned reduction (-0.8%) aligned with the operational efficiency strategy. Casual and temporary staff represent 15% of total headcount, up from 12% last year.',
    keyFactors: [
      'Opportunity: Clinical headcount grew 3.2% YoY, keeping pace with patient volume growth of 2.8%.',
      'Risk: Casual/temporary staff ratio increased to 15%, increasing benefit costs and reducing continuity of care.',
      'Risk: Rural zones show net headcount decline of 1.2% despite high vacancy postings.',
      'Opportunity: Allied Health headcount grew 4.1% following expansion of rehabilitation services.',
    ],
    recommendation: 'Convert 200 high-utilization casual positions to Regular Part-Time (RPT) classification to reduce premium costs and improve retention. Develop targeted rural recruitment strategy with housing and relocation incentives to reverse net headcount decline in North and Central Zones.',
    kpis: [
      { label: 'Total Headcount', value: '112,500', change: '+2.1%', status: 'good' },
      { label: 'Clinical FTE', value: '87,750', change: '+3.2%', status: 'good' },
      { label: 'Casual/Temp Ratio', value: '15.0%', change: '+3.0%', status: 'warning' },
      { label: 'New Hires YTD', value: '3,240', change: '+15%', status: 'good' },
    ],
    chartData: [
      { label: 'Q1 FY25', value: 108200, target: 110000, previous: 105000 },
      { label: 'Q2 FY25', value: 109100, target: 110000, previous: 106000 },
      { label: 'Q3 FY25', value: 110200, target: 111000, previous: 107500 },
      { label: 'Q4 FY25', value: 110800, target: 112000, previous: 109000 },
      { label: 'Q1 FY26', value: 111400, target: 112500, previous: 108200 },
      { label: 'Q2 FY26', value: 112500, target: 113500, previous: 109100 },
    ],
    tableData: [
      { label: 'Calgary Zone', current: '42,750', previous: '41,200', change: '+3.8%', status: 'good' },
      { label: 'Edmonton Zone', current: '39,375', previous: '38,100', change: '+3.3%', status: 'good' },
      { label: 'Central Zone', current: '13,500', previous: '13,650', change: '-1.1%', status: 'warning' },
      { label: 'North Zone', current: '10,125', previous: '10,250', change: '-1.2%', status: 'warning' },
      { label: 'South Zone', current: '6,750', previous: '6,700', change: '+0.7%', status: 'good' },
    ],
  },

  vacancies: {
    summary: 'Active vacancies stand at 142 FTE, an increase of 18 positions over the prior quarter. The vacancy concentration is highest in Registered Nursing (RN) roles in rural zones, accounting for 68% of total unfilled positions. The current vacancy rate of 5.2% is above the 4.0% organizational target and is contributing significantly to overtime expenditure and care delivery strain.',
    keyFactors: [
      'Risk: 142 open FTE positions represent an annualized overtime replacement cost of approximately $3.1M.',
      'Risk: Rural nursing vacancies have been open an average of 68 days, far exceeding the 45-day target.',
      'Risk: Credentialing delays are extending time-to-fill for specialized roles by an average of 12 days.',
      'Opportunity: Calgary and Edmonton recruitment hubs have reduced vacancy rates by 18% through new sourcing channels.',
    ],
    recommendation: 'Launch emergency rural recruitment campaign with competitive relocation packages ($10,000–$15,000) and first-year retention bonuses. Engage three additional per-diem nursing agencies for the North Zone to bridge the gap while permanent hiring is accelerated. Review credentialing process to remove bottlenecks causing delay beyond 14 business days.',
    kpis: [
      { label: 'Open Vacancies', value: '142 FTE', change: '+18 QoQ', status: 'critical' },
      { label: 'Vacancy Rate', value: '5.2%', change: '+1.1%', status: 'warning' },
      { label: 'Avg Days Open', value: '54 days', change: '+9 days', status: 'critical' },
      { label: 'Rural Vacancies', value: '68%', change: 'of total', status: 'critical' },
    ],
    chartData: [
      { label: 'Apr', value: 98, target: 75, previous: 82 },
      { label: 'May', value: 104, target: 75, previous: 89 },
      { label: 'Jun', value: 110, target: 75, previous: 92 },
      { label: 'Jul', value: 118, target: 75, previous: 95 },
      { label: 'Aug', value: 124, target: 75, previous: 98 },
      { label: 'Sep', value: 130, target: 75, previous: 101 },
      { label: 'Oct', value: 136, target: 75, previous: 108 },
      { label: 'Nov', value: 138, target: 75, previous: 112 },
      { label: 'Dec', value: 142, target: 75, previous: 120 },
    ],
    tableData: [
      { label: 'Registered Nurse (RN)', current: '97 FTE', previous: '78 FTE', change: '+24.4%', status: 'critical' },
      { label: 'Licensed Practical Nurse (LPN)', current: '22 FTE', previous: '18 FTE', change: '+22.2%', status: 'warning' },
      { label: 'Allied Health', current: '14 FTE', previous: '12 FTE', change: '+16.7%', status: 'warning' },
      { label: 'Administrative', current: '5 FTE', previous: '8 FTE', change: '-37.5%', status: 'good' },
      { label: 'Leadership/Management', current: '4 FTE', previous: '8 FTE', change: '-50.0%', status: 'good' },
    ],
  },

  attrition: {
    summary: 'Overall attrition for FY 2026 YTD stands at 8.7%, a marginal improvement from 9.1% recorded in FY 2025. Voluntary turnover at 6.1% remains the primary concern, particularly within clinical leadership roles where voluntary attrition has reached 15.2% — more than double the organizational average. The annual cost of attrition, including recruitment, onboarding and productivity loss, is estimated at $18.4M.',
    keyFactors: [
      'Risk: Clinical leadership voluntary turnover at 15.2% is creating succession gaps in 8 of 12 key departments.',
      'Risk: Compensation benchmarking shows clinical leads are paid 12% below comparable market rates.',
      'Risk: Exit interview data identifies workload/burnout as the primary reason for departure in 58% of voluntary exits.',
      'Opportunity: South Zone retention program reduced attrition by 4% this quarter — ready to scale system-wide.',
    ],
    recommendation: 'Conduct immediate compensation review for clinical leadership roles, targeting market parity within 2 pay cycles. Expand the South Zone retention program (quarterly check-ins, career pathway planning, wellness days) to Central and North Zones by Q2. Implement stay interviews for all staff with 2–4 years of service.',
    kpis: [
      { label: 'Overall Attrition', value: '8.7%', change: '-0.4%', status: 'good' },
      { label: 'Voluntary Turnover', value: '6.1%', change: '+0.8%', status: 'warning' },
      { label: 'Clinical Lead OT', value: '15.2%', change: '+2.1%', status: 'critical' },
      { label: 'Annual Cost', value: '$18.4M', change: '+6.2%', status: 'critical' },
    ],
    chartData: [
      { label: 'Apr', value: 9.1, target: 8.5, previous: 9.8 },
      { label: 'May', value: 8.9, target: 8.5, previous: 9.5 },
      { label: 'Jun', value: 9.2, target: 8.5, previous: 9.4 },
      { label: 'Jul', value: 8.8, target: 8.5, previous: 9.1 },
      { label: 'Aug', value: 8.5, target: 8.5, previous: 9.0 },
      { label: 'Sep', value: 8.6, target: 8.5, previous: 8.8 },
      { label: 'Oct', value: 8.4, target: 8.5, previous: 8.7 },
      { label: 'Nov', value: 8.7, target: 8.5, previous: 8.6 },
      { label: 'Dec', value: 8.7, target: 8.5, previous: 9.1 },
    ],
    tableData: [
      { label: 'Calgary Zone', current: '7.9%', previous: '8.4%', change: '-0.5%', status: 'good' },
      { label: 'Edmonton Zone', current: '8.6%', previous: '9.2%', change: '-0.6%', status: 'good' },
      { label: 'Central Zone', current: '9.4%', previous: '9.8%', change: '-0.4%', status: 'warning' },
      { label: 'North Zone', current: '10.2%', previous: '10.8%', change: '-0.6%', status: 'critical' },
      { label: 'South Zone', current: '6.8%', previous: '8.1%', change: '-1.3%', status: 'good' },
      { label: 'Clinical Leadership', current: '15.2%', previous: '13.1%', change: '+2.1%', status: 'critical' },
    ],
  },

  engagement: {
    summary: 'Employee engagement for FY 2026 stands at 72 out of 100, a 5-point improvement over FY 2025. This improvement follows the system-wide Q3 wellness initiative and the introduction of flexible scheduling options in Calgary and Edmonton. Participation in the annual engagement survey increased to 81%, the highest response rate in four years, indicating improved trust and psychological safety.',
    keyFactors: [
      'Opportunity: Overall engagement rose 5 points to 72/100 following wellness and flexibility initiatives.',
      'Opportunity: Survey participation reached 81%, highest in 4 years — improving reliability of data.',
      'Risk: Manager effectiveness scores remain below target (58/100 vs 70/100 target) in North Zone.',
      'Risk: Work-life balance dimension scored only 61/100 — lowest-scoring area in the survey.',
    ],
    recommendation: 'Deploy targeted manager effectiveness training for North Zone leadership in Q2. Develop a work-life balance action plan with specific, measurable commitments (e.g., minimum 4 weeks advance scheduling notice, guaranteed days-off requests honored within 72 hours). Launch pulse surveys quarterly to track real-time improvement.',
    kpis: [
      { label: 'Engagement Score', value: '72/100', change: '+5 pts', status: 'good' },
      { label: 'Survey Participation', value: '81%', change: '+12%', status: 'good' },
      { label: 'Manager Effectiveness', value: '58/100', change: '-2 pts', status: 'warning' },
      { label: 'Work-Life Balance', value: '61/100', change: '+3 pts', status: 'warning' },
    ],
    chartData: [
      { label: 'Q1 FY24', value: 64, target: 72, previous: 61 },
      { label: 'Q2 FY24', value: 65, target: 72, previous: 62 },
      { label: 'Q3 FY24', value: 66, target: 72, previous: 63 },
      { label: 'Q4 FY24', value: 67, target: 72, previous: 64 },
      { label: 'Q1 FY25', value: 67, target: 72, previous: 65 },
      { label: 'Q2 FY25', value: 69, target: 72, previous: 67 },
      { label: 'Q3 FY25', value: 72, target: 72, previous: 68 },
    ],
    tableData: [
      { label: 'Compensation & Benefits', current: '74/100', previous: '70/100', change: '+4 pts', status: 'good' },
      { label: 'Work-Life Balance', current: '61/100', previous: '58/100', change: '+3 pts', status: 'warning' },
      { label: 'Career Development', current: '68/100', previous: '65/100', change: '+3 pts', status: 'good' },
      { label: 'Manager Effectiveness', current: '58/100', previous: '60/100', change: '-2 pts', status: 'warning' },
      { label: 'Mission & Values', current: '82/100', previous: '79/100', change: '+3 pts', status: 'good' },
      { label: 'Workplace Safety', current: '78/100', previous: '74/100', change: '+4 pts', status: 'good' },
    ],
  },

  'time-to-fill': {
    summary: 'Average time-to-fill for FY 2026 stands at 42 days, a 3-day improvement over the prior year and 3 days below the 45-day organizational target. Improvements are driven by streamlined job posting processes, the introduction of a virtual interview platform, and a faster background check vendor. However, specialized roles (ICU RN, OR Technologist, Radiologist) continue to take significantly longer — averaging 72 days.',
    keyFactors: [
      'Opportunity: Average time-to-fill reduced to 42 days, meeting the organizational target 3 months ahead of schedule.',
      'Opportunity: Virtual interview platform reduced scheduling lag by an average of 4.2 days per hire.',
      'Risk: Specialized clinical roles average 72 days to fill, well above the 45-day target.',
      'Risk: Rural postings take an average of 68 days, driven by limited applicant pools and credentialing delays.',
    ],
    recommendation: 'Maintain gains in general hiring. For specialized roles, build a proactive talent pipeline through partnerships with nursing schools and allied health programs. For rural postings, implement an accelerated rural recruitment track with dedicated coordinators and streamlined credentialing review.',
    kpis: [
      { label: 'Avg Time to Fill', value: '42 days', change: '-3 days', status: 'good' },
      { label: 'Specialized Roles', value: '72 days', change: '+4 days', status: 'critical' },
      { label: 'Rural Postings', value: '68 days', change: '-2 days', status: 'warning' },
      { label: 'Hires Completed', value: '3,240', change: '+15%', status: 'good' },
    ],
    chartData: [
      { label: 'Apr', value: 48, target: 45, previous: 52 },
      { label: 'May', value: 46, target: 45, previous: 50 },
      { label: 'Jun', value: 45, target: 45, previous: 48 },
      { label: 'Jul', value: 44, target: 45, previous: 47 },
      { label: 'Aug', value: 43, target: 45, previous: 46 },
      { label: 'Sep', value: 41, target: 45, previous: 45 },
      { label: 'Oct', value: 42, target: 45, previous: 44 },
      { label: 'Nov', value: 40, target: 45, previous: 44 },
      { label: 'Dec', value: 42, target: 45, previous: 45 },
    ],
    tableData: [
      { label: 'Registered Nurse (RN)', current: '44 days', previous: '48 days', change: '-4 days', status: 'good' },
      { label: 'ICU / OR Specialist', current: '72 days', previous: '68 days', change: '+4 days', status: 'critical' },
      { label: 'Allied Health', current: '38 days', previous: '41 days', change: '-3 days', status: 'good' },
      { label: 'Administrative', current: '22 days', previous: '28 days', change: '-6 days', status: 'good' },
      { label: 'Leadership/Management', current: '55 days', previous: '58 days', change: '-3 days', status: 'warning' },
      { label: 'Rural Postings (All)', current: '68 days', previous: '70 days', change: '-2 days', status: 'warning' },
    ],
  },

  credentialing: {
    summary: 'Credentialing compliance for FY 2026 stands at 89.3%, a 2.1 percentage point improvement over FY 2025. Gains are driven by the implementation of an automated credential tracking system and a proactive renewal reminder program. Non-compliant staff (10.7%) are primarily in rural zones where access to credentialing bodies is more limited. Expired credentials are creating liability exposure and are delaying new hire placement.',
    keyFactors: [
      'Opportunity: Automated reminder system reduced expired credentials by 24% in Calgary and Edmonton.',
      'Risk: North Zone credentialing compliance at 81.4% is well below the 90% mandatory threshold.',
      'Risk: 24 staff members have been temporarily removed from clinical duties pending credential renewal.',
      'Risk: Average credentialing processing time of 18 business days is creating placement delays for new hires.',
    ],
    recommendation: 'Mandate credentialing audits for all North Zone staff within 30 days. Partner with credentialing bodies to establish on-site renewal clinics in rural zones. Reduce processing time target to 10 business days by digitizing the remaining paper-based submission components. Implement a credential expiry dashboard for all managers.',
    kpis: [
      { label: 'Compliance Rate', value: '89.3%', change: '+2.1%', status: 'warning' },
      { label: 'Expired Credentials', value: '312 staff', change: '-24%', status: 'warning' },
      { label: 'Processing Time', value: '18 days', change: '-2 days', status: 'warning' },
      { label: 'Staff on Hold', value: '24 FTE', change: '-8', status: 'warning' },
    ],
    chartData: [
      { label: 'Apr', value: 86.2, target: 92.0, previous: 84.1 },
      { label: 'May', value: 87.0, target: 92.0, previous: 84.8 },
      { label: 'Jun', value: 87.8, target: 92.0, previous: 85.2 },
      { label: 'Jul', value: 88.4, target: 92.0, previous: 85.8 },
      { label: 'Aug', value: 89.1, target: 92.0, previous: 86.5 },
      { label: 'Sep', value: 88.9, target: 92.0, previous: 87.1 },
      { label: 'Oct', value: 89.5, target: 92.0, previous: 87.2 },
      { label: 'Nov', value: 89.2, target: 92.0, previous: 87.0 },
      { label: 'Dec', value: 89.3, target: 92.0, previous: 87.2 },
    ],
    tableData: [
      { label: 'Calgary Zone', current: '93.8%', previous: '91.2%', change: '+2.6%', status: 'good' },
      { label: 'Edmonton Zone', current: '92.4%', previous: '89.8%', change: '+2.6%', status: 'good' },
      { label: 'Central Zone', current: '88.1%', previous: '86.4%', change: '+1.7%', status: 'warning' },
      { label: 'North Zone', current: '81.4%', previous: '80.2%', change: '+1.2%', status: 'critical' },
      { label: 'South Zone', current: '91.2%', previous: '88.9%', change: '+2.3%', status: 'good' },
    ],
  },

  succession: {
    summary: 'Succession planning coverage for critical leadership roles stands at 67%, meaning only 67% of identified critical positions have a documented, ready-now or ready-in-12-months successor. This is a 4 percentage point improvement over FY 2025 but remains 13 points below the 80% organizational target. Clinical Director and Zone Vice President roles are the most exposed, with multiple positions having no identified successors.',
    keyFactors: [
      'Risk: 33% of critical roles have no documented successor, creating organizational fragility.',
      'Risk: Clinical Director roles show 48% coverage — the lowest of any leadership tier.',
      'Opportunity: The emerging leaders program has produced 18 succession-ready candidates in FY 2026.',
      'Opportunity: Two internal candidates are now ready-now for Zone VP succession — up from zero last year.',
    ],
    recommendation: 'Accelerate development of mid-level clinical leaders through a structured 12-month "Clinical Director Pathway" program. Mandate succession plan documentation for all VP and Director-level roles within 60 days. Introduce succession health as a standing item on quarterly Executive HR reviews.',
    kpis: [
      { label: 'Succession Coverage', value: '67%', change: '+4%', status: 'warning' },
      { label: 'Ready-Now Successors', value: '24', change: '+6', status: 'good' },
      { label: 'Clinical Dir Coverage', value: '48%', change: '+3%', status: 'critical' },
      { label: 'Emerging Leaders', value: '18', change: '+8', status: 'good' },
    ],
    chartData: [
      { label: 'Zone VPs', value: 75, target: 80, previous: 67 },
      { label: 'Clinical Directors', value: 48, target: 80, previous: 45 },
      { label: 'Department Managers', value: 72, target: 80, previous: 68 },
      { label: 'Charge Nurses', value: 80, target: 80, previous: 74 },
      { label: 'Allied Health Leads', value: 65, target: 80, previous: 58 },
      { label: 'Support Services', value: 71, target: 80, previous: 66 },
    ],
    tableData: [
      { label: 'Zone VP', current: '75%', previous: '67%', change: '+8%', status: 'good' },
      { label: 'Clinical Director', current: '48%', previous: '45%', change: '+3%', status: 'critical' },
      { label: 'Department Manager', current: '72%', previous: '68%', change: '+4%', status: 'good' },
      { label: 'Charge Nurse', current: '80%', previous: '74%', change: '+6%', status: 'good' },
      { label: 'Allied Health Lead', current: '65%', previous: '58%', change: '+7%', status: 'warning' },
      { label: 'Support Services Lead', current: '71%', previous: '66%', change: '+5%', status: 'good' },
    ],
  },

  learning: {
    summary: 'Learning and development completion rates for FY 2026 stand at 84.1%, a 6.3 percentage point improvement over FY 2025. This is the first time the organization has exceeded the 80% target since FY 2021. The improvement is attributed to the launch of the online learning platform (MyLearning) which increased accessibility for part-time and casual staff. Mandatory compliance training (WHMIS, IPAC, AODA) is at 91.2% completion.',
    keyFactors: [
      'Opportunity: Overall L&D completion reached 84.1%, exceeding the 80% target for the first time since FY 2021.',
      'Opportunity: MyLearning platform increased casual/part-time participation from 41% to 68%.',
      'Risk: Leadership development program enrollment is at 62% — below the 75% target.',
      'Risk: North Zone completion rate at 74.2% is the only zone below the 80% target.',
    ],
    recommendation: 'Investigate and remove barriers to leadership program enrollment (scheduling conflicts, awareness gaps). Provide dedicated learning time allocations (minimum 4 hours/month) in North Zone to close the completion gap. Expand the MyLearning catalog with 20 new clinical competency modules by end of Q2.',
    kpis: [
      { label: 'Overall Completion', value: '84.1%', change: '+6.3%', status: 'good' },
      { label: 'Mandatory Training', value: '91.2%', change: '+4.1%', status: 'good' },
      { label: 'Leadership Programs', value: '62%', change: '+8%', status: 'warning' },
      { label: 'Casual/PT Completion', value: '68%', change: '+27%', status: 'good' },
    ],
    chartData: [
      { label: 'Apr', value: 76.2, target: 80.0, previous: 71.4 },
      { label: 'May', value: 78.1, target: 80.0, previous: 73.2 },
      { label: 'Jun', value: 79.8, target: 80.0, previous: 74.8 },
      { label: 'Jul', value: 81.2, target: 80.0, previous: 76.1 },
      { label: 'Aug', value: 82.4, target: 80.0, previous: 77.2 },
      { label: 'Sep', value: 83.1, target: 80.0, previous: 78.0 },
      { label: 'Oct', value: 83.8, target: 80.0, previous: 78.4 },
      { label: 'Nov', value: 84.0, target: 80.0, previous: 77.8 },
      { label: 'Dec', value: 84.1, target: 80.0, previous: 77.8 },
    ],
    tableData: [
      { label: 'Calgary Zone', current: '87.4%', previous: '80.2%', change: '+7.2%', status: 'good' },
      { label: 'Edmonton Zone', current: '85.8%', previous: '79.1%', change: '+6.7%', status: 'good' },
      { label: 'Central Zone', current: '83.2%', previous: '77.4%', change: '+5.8%', status: 'good' },
      { label: 'North Zone', current: '74.2%', previous: '68.8%', change: '+5.4%', status: 'warning' },
      { label: 'South Zone', current: '88.1%', previous: '81.2%', change: '+6.9%', status: 'good' },
      { label: 'Mandatory (all zones)', current: '91.2%', previous: '87.1%', change: '+4.1%', status: 'good' },
    ],
  },
};
