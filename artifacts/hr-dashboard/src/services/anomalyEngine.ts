/**
 * Anomaly Detection Engine — Z-Score Based
 *
 * Computes Modified Z-scores on simulated KPI time-series data to detect
 * statistically significant deviations. Uses Median Absolute Deviation (MAD)
 * which is more robust to outliers than standard deviation.
 *
 * Formula: Z = (x - median) / (1.4826 × MAD)
 * Alert threshold: |Z| > 2.5
 */

// ── KPI Time Series (simulated 12-week trailing data) ──────────────────────

interface KpiSeries {
  id: string;
  label: string;
  unit: string;
  direction: 'lower-is-better' | 'higher-is-better';
  impactWeight: number; // business impact multiplier (1–5)
  data: number[];       // 12 weekly observations, most recent last
}

const KPI_SERIES: KpiSeries[] = [
  {
    id: 'overtime-rate',
    label: 'Overtime Rate',
    unit: '%',
    direction: 'lower-is-better',
    impactWeight: 5,
    data: [10.1, 10.3, 10.0, 10.5, 10.2, 10.4, 10.6, 10.8, 11.0, 11.3, 12.1, 12.9],
  },
  {
    id: 'sick-leave',
    label: 'Sick Leave Utilization',
    unit: '%',
    direction: 'lower-is-better',
    impactWeight: 4,
    data: [4.2, 4.1, 4.3, 4.0, 4.2, 4.5, 4.4, 4.6, 5.0, 5.2, 5.8, 6.3],
  },
  {
    id: 'vacancy-rate',
    label: 'Vacancy Rate',
    unit: '%',
    direction: 'lower-is-better',
    impactWeight: 4,
    data: [4.1, 4.0, 4.2, 4.3, 4.1, 4.4, 4.5, 4.6, 4.8, 5.0, 5.1, 5.2],
  },
  {
    id: 'time-to-fill',
    label: 'Time to Fill',
    unit: 'days',
    direction: 'lower-is-better',
    impactWeight: 3,
    data: [48, 47, 46, 45, 46, 44, 43, 44, 43, 42, 41, 42],
  },
  {
    id: 'engagement',
    label: 'Engagement Score',
    unit: '/100',
    direction: 'higher-is-better',
    impactWeight: 3,
    data: [65, 66, 66, 67, 67, 68, 69, 69, 70, 71, 72, 72],
  },
  {
    id: 'attrition',
    label: 'Attrition Rate',
    unit: '%',
    direction: 'lower-is-better',
    impactWeight: 5,
    data: [9.1, 9.0, 9.2, 8.9, 9.1, 8.8, 8.6, 8.5, 8.7, 8.5, 8.4, 8.7],
  },
  {
    id: 'new-hires',
    label: 'New Hires (Weekly)',
    unit: 'FTE',
    direction: 'higher-is-better',
    impactWeight: 3,
    data: [52, 55, 48, 51, 53, 56, 54, 58, 60, 62, 65, 68],
  },
  {
    id: 'credentialing',
    label: 'Credentialing Compliance',
    unit: '%',
    direction: 'higher-is-better',
    impactWeight: 4,
    data: [87.2, 87.5, 87.8, 88.0, 88.1, 88.4, 88.6, 88.9, 89.0, 89.1, 89.2, 89.3],
  },
];

// ── Statistical Functions ───────────────────────────────────────────────────

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function mad(arr: number[]): number {
  const med = median(arr);
  const deviations = arr.map(v => Math.abs(v - med));
  return median(deviations);
}

function modifiedZScore(value: number, dataset: number[]): number {
  const med = median(dataset);
  const madValue = mad(dataset);
  if (madValue === 0) return 0; // no variation
  return (value - med) / (1.4826 * madValue);
}

// ── Anomaly Detection ───────────────────────────────────────────────────────

export interface Anomaly {
  id: string;
  kpiLabel: string;
  currentValue: number;
  unit: string;
  zScore: number;
  severity: 'critical' | 'warning' | 'positive';
  direction: 'up' | 'down';
  changePercent: number;
  description: string;
  priorityScore: number;
}

export function detectAnomalies(): Anomaly[] {
  const anomalies: Anomaly[] = [];

  for (const kpi of KPI_SERIES) {
    const current = kpi.data[kpi.data.length - 1];
    const previous = kpi.data[kpi.data.length - 2];
    const baseline = kpi.data.slice(0, -1); // exclude latest for baseline
    const z = modifiedZScore(current, baseline);
    const absZ = Math.abs(z);

    if (absZ < 1.8) continue; // not anomalous enough

    const direction: 'up' | 'down' = current > median(baseline) ? 'up' : 'down';
    const changeVsPrev = previous !== 0
      ? Math.round(((current - previous) / previous) * 1000) / 10
      : 0;

    // Determine severity
    let severity: 'critical' | 'warning' | 'positive';

    if (kpi.direction === 'lower-is-better') {
      // Rising is bad, falling is good
      severity = direction === 'up'
        ? (absZ >= 2.5 ? 'critical' : 'warning')
        : 'positive';
    } else {
      // Rising is good, falling is bad
      severity = direction === 'down'
        ? (absZ >= 2.5 ? 'critical' : 'warning')
        : 'positive';
    }

    // Generate description
    const trendWord = direction === 'up' ? 'increased' : 'decreased';
    const med = median(baseline);
    const deviationFromMedian = Math.abs(
      Math.round(((current - med) / med) * 1000) / 10
    );

    let description: string;
    if (severity === 'critical') {
      description = `${kpi.label} has ${trendWord} to ${current}${kpi.unit}, a ${deviationFromMedian}% deviation from 12-week baseline. Immediate attention required.`;
    } else if (severity === 'warning') {
      description = `${kpi.label} ${trendWord} to ${current}${kpi.unit}, trending ${deviationFromMedian}% from baseline. Monitor closely.`;
    } else {
      description = `${kpi.label} ${trendWord} to ${current}${kpi.unit} — a positive shift of ${deviationFromMedian}% from baseline.`;
    }

    // Priority = Z × weight × recency (latest always has recency=1)
    const priorityScore = Math.round(absZ * kpi.impactWeight * 100) / 100;

    anomalies.push({
      id: kpi.id,
      kpiLabel: kpi.label,
      currentValue: current,
      unit: kpi.unit,
      zScore: Math.round(z * 100) / 100,
      severity,
      direction,
      changePercent: changeVsPrev,
      description,
      priorityScore,
    });
  }

  // Sort by priority (highest first), critical before warning, warning before positive
  const severityOrder = { critical: 0, warning: 1, positive: 2 };
  anomalies.sort((a, b) => {
    const sev = severityOrder[a.severity] - severityOrder[b.severity];
    if (sev !== 0) return sev;
    return b.priorityScore - a.priorityScore;
  });

  return anomalies.slice(0, 5);
}
