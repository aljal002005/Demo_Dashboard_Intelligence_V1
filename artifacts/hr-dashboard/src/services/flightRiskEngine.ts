/**
 * Flight Risk Prediction Engine
 *
 * Simulates an XGBoost-trained model for employee attrition prediction.
 * Produces per-employee risk scores with SHAP-like feature contribution
 * breakdowns, department-level risk aggregations, and 30/60/90-day
 * attrition probability windows.
 *
 * Scientific approach:
 * - Weighted feature scoring with non-linear interaction terms
 * - Sigmoid calibration for probability output (logistic function)
 * - Feature contribution analysis (analogous to SHAP values)
 * - Seeded pseudo-random employee generation for consistent results
 */

// ── Types ───────────────────────────────────────────────────────────────────

export interface RiskFeature {
  name: string;
  value: number;        // normalized 0–1
  weight: number;       // model weight
  contribution: number; // SHAP-like: how much this feature pushes risk up/down
  label: string;        // human-readable interpretation
  direction: 'risk' | 'protective'; // is this increasing or decreasing risk?
}

export interface EmployeeRisk {
  id: string;
  name: string;
  role: string;
  department: string;
  tenure: number;        // years
  riskScore: number;     // 0–100
  probability30: number; // 30-day attrition probability (%)
  probability60: number;
  probability90: number;
  riskTier: 'critical' | 'high' | 'moderate' | 'low';
  topFactors: RiskFeature[];
  trend: 'rising' | 'stable' | 'declining';
}

export interface DepartmentRisk {
  name: string;
  avgRiskScore: number;
  criticalCount: number;
  highCount: number;
  moderateCount: number;
  lowCount: number;
  totalEmployees: number;
  topRiskFactor: string;
  trend: 'rising' | 'stable' | 'declining';
  employees: EmployeeRisk[];
}

export interface ModelMetrics {
  auc: number;
  precision: number;
  recall: number;
  f1: number;
  lastTrained: string;
  trainingSize: number;
  featureCount: number;
}

export interface FlightRiskResult {
  departments: DepartmentRisk[];
  highRiskEmployees: EmployeeRisk[];
  modelMetrics: ModelMetrics;
  overallRiskDistribution: { tier: string; count: number; percentage: number }[];
  topRiskFactors: { factor: string; avgContribution: number }[];
}

// ── Seeded Random (deterministic for consistent demo) ───────────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

// ── Feature Definitions (simulating trained model weights) ──────────────────

interface FeatureSpec {
  name: string;
  weight: number; // how strongly this feature predicts attrition
  generateValue: (dept: string, rng: () => number) => number; // returns 0–1
  labelFn: (value: number) => string;
}

const FEATURE_SPECS: FeatureSpec[] = [
  {
    name: 'Compensation Gap',
    weight: 0.22,
    generateValue: (dept, rng) => {
      const deptBias: Record<string, number> = {
        'Emergency': 0.72, 'ICU': 0.68, 'Mental Health': 0.60, 'Surgery': 0.50,
        'Oncology': 0.48, 'Orthopedics': 0.35, 'Allied Health': 0.40,
        'Radiology': 0.30, 'Administration': 0.25
      };
      return Math.min(1, Math.max(0, (deptBias[dept] ?? 0.4) + (rng() - 0.5) * 0.3));
    },
    labelFn: v => v > 0.7 ? 'Significantly below market (-15%+)' : v > 0.5 ? 'Below market (-8%)' : v > 0.3 ? 'Near market rate' : 'At or above market',
  },
  {
    name: 'Overtime Load',
    weight: 0.19,
    generateValue: (dept, rng) => {
      const deptBias: Record<string, number> = {
        'Emergency': 0.85, 'ICU': 0.78, 'Surgery': 0.60, 'Mental Health': 0.55,
        'Oncology': 0.50, 'Orthopedics': 0.40, 'Allied Health': 0.35,
        'Radiology': 0.30, 'Administration': 0.15
      };
      return Math.min(1, Math.max(0, (deptBias[dept] ?? 0.4) + (rng() - 0.5) * 0.25));
    },
    labelFn: v => v > 0.7 ? 'Chronic OT (>55 hrs/wk)' : v > 0.5 ? 'Elevated OT (45-55 hrs/wk)' : v > 0.3 ? 'Moderate OT (40-45 hrs/wk)' : 'Normal hours (<40 hrs/wk)',
  },
  {
    name: 'Work-Life Balance',
    weight: 0.16,
    generateValue: (dept, rng) => {
      const deptBias: Record<string, number> = {
        'Emergency': 0.80, 'ICU': 0.72, 'Mental Health': 0.65, 'Surgery': 0.55,
        'Oncology': 0.50, 'Orthopedics': 0.38, 'Allied Health': 0.35,
        'Radiology': 0.30, 'Administration': 0.20
      };
      return Math.min(1, Math.max(0, (deptBias[dept] ?? 0.4) + (rng() - 0.5) * 0.3));
    },
    labelFn: v => v > 0.7 ? 'Poor — frequent schedule conflicts' : v > 0.5 ? 'Below average' : v > 0.3 ? 'Adequate' : 'Good — flexible scheduling',
  },
  {
    name: 'Career Progression',
    weight: 0.14,
    generateValue: (_dept, rng) => Math.min(1, Math.max(0, 0.45 + (rng() - 0.5) * 0.5)),
    labelFn: v => v > 0.7 ? 'Stagnant — no promotion in 4+ yrs' : v > 0.5 ? 'Limited — few pathways' : v > 0.3 ? 'Some opportunities' : 'Active growth pathway',
  },
  {
    name: 'Manager Relationship',
    weight: 0.11,
    generateValue: (_dept, rng) => Math.min(1, Math.max(0, 0.35 + (rng() - 0.5) * 0.5)),
    labelFn: v => v > 0.7 ? 'Poor — conflict reported' : v > 0.5 ? 'Below average' : v > 0.3 ? 'Satisfactory' : 'Strong — positive feedback',
  },
  {
    name: 'Engagement Score',
    weight: 0.10,
    generateValue: (_dept, rng) => Math.min(1, Math.max(0, 0.4 + (rng() - 0.5) * 0.5)),
    labelFn: v => v > 0.7 ? 'Disengaged (score <45/100)' : v > 0.5 ? 'Neutral (45-60/100)' : v > 0.3 ? 'Engaged (60-75/100)' : 'Highly engaged (75+/100)',
  },
  {
    name: 'Peer Attrition',
    weight: 0.08,
    generateValue: (dept, rng) => {
      const deptBias: Record<string, number> = {
        'Emergency': 0.70, 'ICU': 0.65, 'Mental Health': 0.55, 'Surgery': 0.45,
        'Oncology': 0.50, 'Orthopedics': 0.35, 'Allied Health': 0.40,
        'Radiology': 0.30, 'Administration': 0.25
      };
      return Math.min(1, Math.max(0, (deptBias[dept] ?? 0.35) + (rng() - 0.5) * 0.2));
    },
    labelFn: v => v > 0.6 ? '3+ peers left recently' : v > 0.4 ? '1-2 peers left' : 'Team stable',
  },
];

// ── Sigmoid Calibration ─────────────────────────────────────────────────────

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

// ── Employee Data Generation ────────────────────────────────────────────────

const DEPARTMENTS = [
  'Emergency', 'ICU', 'Mental Health', 'Surgery', 'Oncology',
  'Orthopedics', 'Allied Health', 'Radiology', 'Administration'
];

const FIRST_NAMES = [
  'J.', 'T.', 'A.', 'D.', 'K.', 'M.', 'R.', 'S.', 'L.', 'P.',
  'N.', 'C.', 'B.', 'E.', 'H.', 'F.', 'G.', 'W.', 'V.', 'Q.'
];

const LAST_NAMES = [
  'Martinez', 'Chen', 'Smith', 'Nguyen', 'Okonkwo', 'Patel', 'Williams',
  'Anderson', 'Kim', 'Davis', 'Rodriguez', 'Thompson', 'Wilson', 'Moore',
  'Taylor', 'Johnson', 'Brown', 'Harris', 'Clark', 'Lewis', 'Robinson',
  'Hall', 'Allen', 'Young', 'Walker', 'Wright', 'Scott', 'Green',
  'Adams', 'Baker', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts'
];

const ROLES = ['RN', 'RN', 'RN', 'LPN', 'RT', 'MD', 'NP', 'PA', 'Tech', 'Admin', 'Coord'];

const EMPLOYEE_COUNTS: Record<string, number> = {
  'Emergency': 12, 'ICU': 10, 'Mental Health': 8, 'Surgery': 9, 'Oncology': 7,
  'Orthopedics': 6, 'Allied Health': 8, 'Radiology': 5, 'Administration': 7
};

function generateEmployees(rng: () => number): EmployeeRisk[] {
  const employees: EmployeeRisk[] = [];
  let nameIdx = 0;

  for (const dept of DEPARTMENTS) {
    const count = EMPLOYEE_COUNTS[dept] ?? 6;

    for (let i = 0; i < count; i++) {
      const firstName = FIRST_NAMES[nameIdx % FIRST_NAMES.length];
      const lastName = LAST_NAMES[nameIdx % LAST_NAMES.length];
      const role = ROLES[Math.floor(rng() * ROLES.length)];
      const tenure = Math.round((0.5 + rng() * 9) * 10) / 10;

      // Compute features
      const features: RiskFeature[] = FEATURE_SPECS.map(spec => {
        const rawValue = spec.generateValue(dept, rng);
        const contribution = rawValue * spec.weight;
        return {
          name: spec.name,
          value: rawValue,
          weight: spec.weight,
          contribution,
          label: spec.labelFn(rawValue),
          direction: rawValue > 0.5 ? 'risk' as const : 'protective' as const,
        };
      });

      // Tenure interaction: 1-3 years = highest risk (enough to leave, not enough to stay)
      const tenureRisk = tenure < 1 ? 0.3 : tenure < 3 ? 0.7 : tenure < 5 ? 0.5 : 0.3;
      const tenureContribution = tenureRisk * 0.08;

      // Compute raw risk score
      const rawScore = features.reduce((sum, f) => sum + f.contribution, 0) + tenureContribution;

      // Calibrate through sigmoid (centers around ~4.5 on the raw scale → 50%)
      const calibratedProb = sigmoid((rawScore - 0.35) * 8);
      const riskScore = Math.round(calibratedProb * 100);

      // Time-window probabilities (30-day is lower, 90-day is higher)
      const probability30 = Math.round(riskScore * 0.35);
      const probability60 = Math.round(riskScore * 0.62);
      const probability90 = riskScore;

      // Risk tier
      const riskTier: EmployeeRisk['riskTier'] =
        riskScore >= 75 ? 'critical' :
        riskScore >= 55 ? 'high' :
        riskScore >= 35 ? 'moderate' : 'low';

      // Trend (simulated — in production, compare to last month's score)
      const trendRoll = rng();
      const trend: EmployeeRisk['trend'] =
        riskScore > 60 ? (trendRoll > 0.4 ? 'rising' : 'stable') :
        riskScore < 30 ? (trendRoll > 0.6 ? 'declining' : 'stable') : 'stable';

      // Sort features by contribution (highest first)
      const sortedFeatures = [...features].sort((a, b) => b.contribution - a.contribution);

      employees.push({
        id: `EMP-${String(nameIdx + 1).padStart(4, '0')}`,
        name: `${firstName} ${lastName}`,
        role,
        department: dept,
        tenure,
        riskScore,
        probability30,
        probability60,
        probability90,
        riskTier,
        topFactors: sortedFeatures.slice(0, 4),
        trend,
      });

      nameIdx++;
    }
  }

  return employees;
}

// ── Core Prediction ─────────────────────────────────────────────────────────

export function computeFlightRisk(): FlightRiskResult {
  const rng = seededRandom(42); // deterministic for consistent demo
  const allEmployees = generateEmployees(rng);

  // Department aggregation
  const departments: DepartmentRisk[] = DEPARTMENTS.map(dept => {
    const deptEmployees = allEmployees.filter(e => e.department === dept);
    const avgRisk = Math.round(deptEmployees.reduce((s, e) => s + e.riskScore, 0) / deptEmployees.length);

    const criticalCount = deptEmployees.filter(e => e.riskTier === 'critical').length;
    const highCount = deptEmployees.filter(e => e.riskTier === 'high').length;
    const moderateCount = deptEmployees.filter(e => e.riskTier === 'moderate').length;
    const lowCount = deptEmployees.filter(e => e.riskTier === 'low').length;

    // Top risk factor for this department
    const factorSums: Record<string, number> = {};
    for (const emp of deptEmployees) {
      for (const f of emp.topFactors) {
        factorSums[f.name] = (factorSums[f.name] ?? 0) + f.contribution;
      }
    }
    const topFactor = Object.entries(factorSums).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Unknown';

    const trend: DepartmentRisk['trend'] =
      criticalCount >= 3 ? 'rising' : criticalCount === 0 ? 'declining' : 'stable';

    return {
      name: dept,
      avgRiskScore: avgRisk,
      criticalCount,
      highCount,
      moderateCount,
      lowCount,
      totalEmployees: deptEmployees.length,
      topRiskFactor: topFactor,
      trend,
      employees: deptEmployees.sort((a, b) => b.riskScore - a.riskScore),
    };
  }).sort((a, b) => b.avgRiskScore - a.avgRiskScore);

  // High risk employees across all departments
  const highRiskEmployees = allEmployees
    .filter(e => e.riskTier === 'critical' || e.riskTier === 'high')
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 10);

  // Overall risk distribution
  const tiers = ['critical', 'high', 'moderate', 'low'] as const;
  const overallRiskDistribution = tiers.map(tier => {
    const count = allEmployees.filter(e => e.riskTier === tier).length;
    return {
      tier: tier.charAt(0).toUpperCase() + tier.slice(1),
      count,
      percentage: Math.round(count / allEmployees.length * 1000) / 10,
    };
  });

  // Top risk factors across organization
  const globalFactorSums: Record<string, number[]> = {};
  for (const emp of allEmployees) {
    for (const f of emp.topFactors) {
      if (!globalFactorSums[f.name]) globalFactorSums[f.name] = [];
      globalFactorSums[f.name].push(f.contribution);
    }
  }
  const topRiskFactors = Object.entries(globalFactorSums)
    .map(([factor, contribs]) => ({
      factor,
      avgContribution: Math.round(contribs.reduce((a, b) => a + b, 0) / contribs.length * 1000) / 1000,
    }))
    .sort((a, b) => b.avgContribution - a.avgContribution);

  // Model metrics (simulated — in production these come from the last training run)
  const modelMetrics: ModelMetrics = {
    auc: 0.847,
    precision: 0.812,
    recall: 0.788,
    f1: 0.799,
    lastTrained: '2026-03-15',
    trainingSize: 24680,
    featureCount: FEATURE_SPECS.length,
  };

  return {
    departments,
    highRiskEmployees,
    modelMetrics,
    overallRiskDistribution,
    topRiskFactors,
  };
}
