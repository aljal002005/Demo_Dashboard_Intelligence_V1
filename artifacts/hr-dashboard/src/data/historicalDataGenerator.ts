import { DASHBOARD_ITEMS } from '../constants';

export interface MetricObservation {
  id: string;        // Unique observation ID
  dateString: string; // 'YYYY-MM'
  metricId: string;  // e.g., 'overtime', 'sick-leave'
  zone: string;      // 'North', 'South', etc.
  actual: number;    // The actual recorded value
  target: number;    // The target threshold
}

const ZONES = ['Calgary', 'Edmonton', 'Central', 'North', 'South'];

// Realistic base values and variance for each metric
const METRIC_PROFILES: Record<string, { base: number; target: number; variance: number }> = {
  'overtime':      { base: 8.5, target: 8.0, variance: 0.15 }, // %
  'sick-leave':    { base: 4.2, target: 4.0, variance: 0.20 }, // %
  'scheduling':    { base: 85,  target: 90,  variance: 0.05 }, // % adherence
  'safety':        { base: 12,  target: 10,  variance: 0.30 }, // incidents
  'headcount':     { base: 22500, target: 23000, variance: 0.02 }, // per zone approx
  'vacancies':     { base: 28,  target: 20,  variance: 0.25 }, // FTEs
  'attrition':     { base: 8.5, target: 8.5, variance: 0.10 }, // %
  'retirement':    { base: 3.2, target: 3.0, variance: 0.08 }, // % eligible
  'engagement':    { base: 68,  target: 75,  variance: 0.08 }, // /100 score
  'time-to-fill':  { base: 45,  target: 40,  variance: 0.15 }, // days
  'credentialing': { base: 88,  target: 95,  variance: 0.05 }, // %
  'succession':    { base: 55,  target: 65,  variance: 0.10 }, // % roles covered
  'learning':      { base: 72,  target: 85,  variance: 0.12 }, // % compliance
};

// Simple pseudo-random generator
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

// Format Date to 'MMM YY' (e.g. 'Jan 25')
export function formatMonthYear(dateString: string): string {
  const date = new Date(dateString + '-01T00:00:00');
  return date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear().toString().slice(-2);
}

/**
 * Generates 5 years of dense monthly data (2021-04 to 2026-03)
 */
export function generateHistoricalDataset(): MetricObservation[] {
  const rng = seededRandom(12345); // Deterministic dataset
  const dataset: MetricObservation[] = [];
  
  const startYear = 2021;
  const startMonth = 4; // April is start of FY
  const totalMonths = 60; // 5 years

  for (let m = 0; m < totalMonths; m++) {
    const currentMonth = ((startMonth - 1 + m) % 12) + 1;
    const currentYear = startYear + Math.floor((startMonth - 1 + m) / 12);
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

    DASHBOARD_ITEMS.forEach(item => {
      const profile = METRIC_PROFILES[item.id] || { base: 50, target: 50, variance: 0.1 };

      ZONES.forEach((zone, zIdx) => {
        // Create some pseudo-realistic trends (seasonality and general drift)
        const timeTrend = m / totalMonths; // 0 to 1
        const seasonality = Math.sin((currentMonth / 12) * Math.PI * 2);
        
        // Add zone-specific bias (North Zone has higher overtime and attrition naturally)
        const zoneBias = (zone === 'North' && (item.id === 'overtime' || item.id === 'attrition')) ? 1.15 :
                         (zone === 'South' && item.id === 'engagement') ? 1.05 : 1.0;

        // General drift over 5 years (some get worse, some get better)
        const metricDrift = (item.theme === 'orange' || item.id === 'attrition' || item.id === 'vacancies') 
          ? (1 + timeTrend * 0.2) // bad metrics grew slowly over 5 years
          : (1 + timeTrend * 0.1); // good metrics also grew slightly
        
        const randomNoise = (rng() - 0.5) * 2 * profile.variance * profile.base;
        
        let actual = profile.base * zoneBias * metricDrift + seasonality * (profile.base * 0.05) + randomNoise;
        
        // Clamp bounds securely
        if (item.id === 'engagement' || item.id === 'learning' || item.id === 'credentialing' || item.id === 'scheduling') {
          actual = Math.min(100, Math.max(0, actual));
        } else if (item.id === 'attrition' || item.id === 'sick-leave' || item.id === 'overtime' || item.id === 'retirement') {
          actual = Math.max(0, actual);
        } else {
          // Whole numbers for headcount, vacancies, safety
          actual = Math.max(0, Math.round(actual));
        }

        dataset.push({
          id: `obs-${dateStr}-${item.id}-${zIdx}`,
          dateString: dateStr,
          metricId: item.id,
          zone,
          actual: Number(actual.toFixed(2)),
          target: profile.target,
        });
      });
    });
  }

  return dataset; // 60 * 13 * 5 = 3900 rows
}

// Evaluate once and cache
export const HISTORICAL_DATASET = generateHistoricalDataset();

/**
 * Filter and aggregate dataset for charting
 */
export function getMetricTimeSeries(metricId: string, zoneFilter?: string | null): { period: string; actual: number; target: number }[] {
  // 1. Filter raw data
  const filtered = HISTORICAL_DATASET.filter(row => 
    row.metricId === metricId && 
    (zoneFilter ? row.zone === zoneFilter : true)
  );

  // 2. Aggregate by date (sum for counts, avg for percentages)
  const isCount = metricId === 'headcount' || metricId === 'vacancies' || metricId === 'safety';

  const aggregated: Record<string, { actualSum: number; targetSum: number; count: number }> = {};
  
  filtered.forEach(row => {
    if (!aggregated[row.dateString]) {
      aggregated[row.dateString] = { actualSum: 0, targetSum: 0, count: 0 };
    }
    aggregated[row.dateString].actualSum += row.actual;
    aggregated[row.dateString].targetSum += row.target;
    aggregated[row.dateString].count += 1;
  });

  // 3. Format output mapping array
  const dates = Object.keys(aggregated).sort();
  return dates.map(dateStr => {
    const group = aggregated[dateStr];
    return {
      period: formatMonthYear(dateStr),
      // for counts, sum across zones. for percents, avg across zones
      actual: isCount ? Math.round(group.actualSum) : Number((group.actualSum / group.count).toFixed(2)),
      target: isCount ? Math.round(group.targetSum) : Number((group.targetSum / group.count).toFixed(2)),
    };
  });
}
