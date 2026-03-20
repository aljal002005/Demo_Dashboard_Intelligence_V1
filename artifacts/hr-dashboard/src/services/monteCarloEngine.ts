/**
 * Monte Carlo Simulation Engine — Workforce Scenario Planner
 *
 * Replaces deterministic linear projections with stochastic simulation.
 * Each lever is modeled as a triangular probability distribution, and
 * 5,000 iterations produce confidence intervals (P10/P50/P90) for
 * headcount, attrition, and cost over a 5-year horizon.
 *
 * Key scientific features:
 * - Triangular distributions for each lever input (min/mode/max)
 * - Correlated hiring-attrition dynamics (higher hiring → lower net attrition)
 * - Compounding year-over-year effects
 * - Sensitivity analysis via tornado diagram data
 */

// ── Types ───────────────────────────────────────────────────────────────────

export interface SimulationLever {
  id: string;
  name: string;
  description: string;
  current: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  // Monte Carlo parameters
  volatility: number; // ± range as fraction of current (e.g., 0.15 = ±15%)
  impact: {
    headcountPerUnit: number;
    costPerUnit: number;       // $ per unit change
    attritionPerUnit: number;  // percentage points per unit change
  };
}

export interface YearProjection {
  year: string;
  p10: number;
  p50: number;
  p90: number;
}

export interface SimulationResult {
  headcount: {
    mean: number;
    p10: number;
    p50: number;
    p90: number;
    std: number;
    yearlyForecast: YearProjection[];
  };
  attrition: {
    mean: number;
    p10: number;
    p50: number;
    p90: number;
    std: number;
    yearlyForecast: YearProjection[];
  };
  cost: {
    mean: number;
    p10: number;
    p50: number;
    p90: number;
    std: number;
  };
  sensitivity: SensitivityItem[];
  iterations: number;
}

export interface SensitivityItem {
  lever: string;
  impactOnHeadcount: number; // absolute delta from baseline at ±1 std
  impactOnAttrition: number;
  impactOnCost: number;
}

// ── Default Levers ──────────────────────────────────────────────────────────

export const BASE_LEVERS: SimulationLever[] = [
  {
    id: 'hiring-rate',
    name: 'Annual Hiring Rate',
    description: 'New hires as % of total workforce',
    current: 8, unit: '%', min: 0, max: 20, step: 0.5,
    volatility: 0.15,
    impact: { headcountPerUnit: 120, costPerUnit: 180000, attritionPerUnit: -0.1 },
  },
  {
    id: 'salary-increase',
    name: 'Merit Increase Budget',
    description: 'Annual salary increase across all bands',
    current: 3.5, unit: '%', min: 0, max: 10, step: 0.5,
    volatility: 0.10,
    impact: { headcountPerUnit: 0, costPerUnit: 500000, attritionPerUnit: -0.8 },
  },
  {
    id: 'retention-prog',
    name: 'Retention Program Investment',
    description: 'Dedicated retention incentive spend',
    current: 0, unit: '$M', min: 0, max: 5, step: 0.25,
    volatility: 0.20,
    impact: { headcountPerUnit: 0, costPerUnit: 1000000, attritionPerUnit: -1.5 },
  },
  {
    id: 'overtime-cap',
    name: 'OT Cap (hrs/wk)',
    description: 'Maximum weekly overtime threshold',
    current: 40, unit: 'h', min: 35, max: 60, step: 1,
    volatility: 0.08,
    impact: { headcountPerUnit: 30, costPerUnit: 50000, attritionPerUnit: -0.3 },
  },
  {
    id: 'agency-use',
    name: 'Agency/Locum Usage',
    description: 'Agency staff as % of clinical workforce',
    current: 5, unit: '%', min: 0, max: 20, step: 0.5,
    volatility: 0.25,
    impact: { headcountPerUnit: -15, costPerUnit: 220000, attritionPerUnit: 0.05 },
  },
];

// ── Random Number Generation ────────────────────────────────────────────────

/** Box-Muller transform for normal distribution */
function normalRandom(mean: number, std: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * std;
}

/**
 * Triangular distribution sample.
 * Mode = most likely value, min/max define the support.
 */
function triangularRandom(min: number, mode: number, max: number): number {
  const u = Math.random();
  const fc = (mode - min) / (max - min);
  if (u < fc) {
    return min + Math.sqrt(u * (max - min) * (mode - min));
  } else {
    return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
  }
}

// ── Percentile Computation ──────────────────────────────────────────────────

function percentile(sorted: number[], p: number): number {
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  const frac = idx - lo;
  return sorted[lo] * (1 - frac) + sorted[hi] * frac;
}

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr: number[], avg: number): number {
  const variance = arr.reduce((sum, v) => sum + (v - avg) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}

// ── Core Simulation ─────────────────────────────────────────────────────────

const ITERATIONS = 5000;
const BASE_HEADCOUNT = 112500;
const BASE_ATTRITION = 8.7;
const FORECAST_YEARS = ['2026', '2027', '2028', '2029', '2030'];

export function runMonteCarloSimulation(levers: SimulationLever[]): SimulationResult {
  // Year-level storage
  const yearlyHeadcounts: number[][] = FORECAST_YEARS.map(() => []);
  const yearlyAttritions: number[][] = FORECAST_YEARS.map(() => []);
  const totalCosts: number[] = [];

  for (let iter = 0; iter < ITERATIONS; iter++) {
    // For each iteration, sample each lever from its distribution
    let headcount = BASE_HEADCOUNT;
    let attritionRate = BASE_ATTRITION;
    let additionalCost = 0;

    // Sample lever effects with uncertainty
    for (const lever of levers) {
      const baseLever = BASE_LEVERS.find(b => b.id === lever.id)!;
      const delta = lever.current - baseLever.current;

      if (Math.abs(delta) < 0.001) continue; // no change

      // Add stochastic noise: lever effect has uncertainty
      const effectMultiplier = triangularRandom(
        1 - lever.volatility,
        1.0,
        1 + lever.volatility
      );

      headcount += delta * lever.impact.headcountPerUnit * effectMultiplier;
      attritionRate += delta * lever.impact.attritionPerUnit * effectMultiplier;
      additionalCost += Math.abs(delta) * lever.impact.costPerUnit * effectMultiplier;
    }

    // Correlated dynamics: higher attrition reduces headcount further
    const attritionHcEffect = (attritionRate - BASE_ATTRITION) * 0.005 * headcount;
    headcount -= attritionHcEffect;

    // Add macro-economic noise (external factors)
    headcount += normalRandom(0, headcount * 0.008);
    attritionRate += normalRandom(0, 0.3);
    additionalCost += normalRandom(0, additionalCost * 0.05);

    // Clamp
    headcount = Math.max(90000, headcount);
    attritionRate = Math.max(2, Math.min(25, attritionRate));
    additionalCost = Math.max(0, additionalCost);

    totalCosts.push(additionalCost);

    // Year-over-year compounding forecast
    const hiringRate = levers.find(l => l.id === 'hiring-rate')?.current ?? 8;
    let yearHc = headcount;
    let yearAttr = attritionRate;

    for (let y = 0; y < FORECAST_YEARS.length; y++) {
      // Each year: growth = hiring - attrition + noise
      const yearGrowthRate = (hiringRate - yearAttr) / 100;
      const yearNoise = normalRandom(0, 0.005); // ±0.5% macro noise per year
      yearHc = yearHc * (1 + yearGrowthRate + yearNoise);
      yearAttr = Math.max(2, yearAttr - normalRandom(0.1, 0.15)); // slight natural attrition decline

      yearlyHeadcounts[y].push(Math.round(yearHc));
      yearlyAttritions[y].push(Math.round(yearAttr * 100) / 100);
    }
  }

  // Compute statistics
  totalCosts.sort((a, b) => a - b);

  const headcountForecasts: YearProjection[] = FORECAST_YEARS.map((year, i) => {
    const sorted = yearlyHeadcounts[i].sort((a, b) => a - b);
    return {
      year,
      p10: Math.round(percentile(sorted, 10)),
      p50: Math.round(percentile(sorted, 50)),
      p90: Math.round(percentile(sorted, 90)),
    };
  });

  const attritionForecasts: YearProjection[] = FORECAST_YEARS.map((year, i) => {
    const sorted = yearlyAttritions[i].sort((a, b) => a - b);
    return {
      year,
      p10: Math.round(percentile(sorted, 10) * 10) / 10,
      p50: Math.round(percentile(sorted, 50) * 10) / 10,
      p90: Math.round(percentile(sorted, 90) * 10) / 10,
    };
  });

  // First-year stats for summary
  const firstYearHc = yearlyHeadcounts[0].sort((a, b) => a - b);
  const firstYearAt = yearlyAttritions[0].sort((a, b) => a - b);
  const hcMean = mean(firstYearHc);
  const atMean = mean(firstYearAt);

  // Sensitivity analysis
  const sensitivity = computeSensitivity(levers);

  return {
    headcount: {
      mean: Math.round(hcMean),
      p10: Math.round(percentile(firstYearHc, 10)),
      p50: Math.round(percentile(firstYearHc, 50)),
      p90: Math.round(percentile(firstYearHc, 90)),
      std: Math.round(stdDev(firstYearHc, hcMean)),
      yearlyForecast: headcountForecasts,
    },
    attrition: {
      mean: Math.round(atMean * 10) / 10,
      p10: Math.round(percentile(firstYearAt, 10) * 10) / 10,
      p50: Math.round(percentile(firstYearAt, 50) * 10) / 10,
      p90: Math.round(percentile(firstYearAt, 90) * 10) / 10,
      std: Math.round(stdDev(firstYearAt, atMean) * 10) / 10,
      yearlyForecast: attritionForecasts,
    },
    cost: {
      mean: Math.round(mean(totalCosts) / 100000) / 10,
      p10: Math.round(percentile(totalCosts, 10) / 100000) / 10,
      p50: Math.round(percentile(totalCosts, 50) / 100000) / 10,
      p90: Math.round(percentile(totalCosts, 90) / 100000) / 10,
      std: Math.round(stdDev(totalCosts, mean(totalCosts)) / 100000) / 10,
    },
    sensitivity,
    iterations: ITERATIONS,
  };
}

// ── Sensitivity Analysis ────────────────────────────────────────────────────

function computeSensitivity(levers: SimulationLever[]): SensitivityItem[] {
  return levers.map(lever => {
    const baseLever = BASE_LEVERS.find(b => b.id === lever.id)!;
    // Compute impact of ±1 step change
    const stepSize = lever.step;

    return {
      lever: lever.name,
      impactOnHeadcount: Math.round(Math.abs(stepSize * lever.impact.headcountPerUnit)),
      impactOnAttrition: Math.round(Math.abs(stepSize * lever.impact.attritionPerUnit) * 100) / 100,
      impactOnCost: Math.round(Math.abs(stepSize * lever.impact.costPerUnit) / 1000) / 1000, // in $M
    };
  }).sort((a, b) => b.impactOnHeadcount - a.impactOnHeadcount);
}

// ── Utility exports ─────────────────────────────────────────────────────────

export const FORECAST_YEAR_LABELS = FORECAST_YEARS;
export { ITERATIONS as MC_ITERATIONS };
