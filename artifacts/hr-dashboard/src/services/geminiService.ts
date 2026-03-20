/**
 * Gemini API Service — Tier 1 AI Copilot
 *
 * Sends structured HR data context + user queries to Google Gemini API.
 * Returns structured JSON responses that the UI can render as KPI cards,
 * charts, and narrative text.
 *
 * Uses direct REST API calls (no SDK dependency needed).
 */

// ── Types ───────────────────────────────────────────────────────────────────

export interface GeminiKpi {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

export interface GeminiChart {
  type: 'bar' | 'line';
  title: string;
  data: Array<Record<string, string | number>>;
  dataKey: string;
  nameKey: string;
  color?: string;
}

export interface GeminiResponse {
  content: string;
  kpis?: GeminiKpi[];
  chart?: GeminiChart;
  suggestions?: string[];
}

// ── HR Data Context ─────────────────────────────────────────────────────────

const HR_DATA_CONTEXT = `
You are an expert HR analytics assistant for a large healthcare organization called "People Analytics".
Below is the current HR data snapshot. Use this data to answer the user's questions with specific numbers.

=== CURRENT HR METRICS (FY 2026 YTD) ===

HEADCOUNT:
- Total Headcount: 112,500 FTE (+2.1% YoY)
- Clinical Staff: 87,750 FTE (78%) — grew +3.2% YoY
- Allied Health: 13,500 FTE (12%)
- Administrative: 11,250 FTE (10%) — reduced -0.8%
- New Hires YTD: 3,240 (+15% vs last year)
- Vacancy Rate: 5.2% (+1.1pp)

ATTRITION:
- Overall Attrition Rate: 8.7% (down from 9.1% last year)
- Voluntary Turnover: 6.1% (+0.8%)
- Clinical Leadership Voluntary Attrition: 15.2% (double org average — CRITICAL)
- Retention Rate: 91.3%
- Open Roles: 142 FTE
- Top attrition drivers: Compensation gaps (-12% vs market for clinical leads), limited career pathways, burnout from overtime

OVERTIME:
- Total OT Hours YTD: 2.08 million hours (+12.4% vs last year)
- OT Cost YTD: $12.4M (+8.2%) — $1.8M OVER approved budget
- OT Rate: 2.9% of total paid hours
- High-Risk Units: 14 (+3 units)
- North Zone Emergency: 520K OT hours (highest)
- Edmonton Zone: 380K hours
- Calgary Zone: 340K hours
- Central Zone: 210K hours
- South Zone: 130K hours (lowest — implemented self-scheduling, reduced OT by 8%)
- 23% of Emergency staff exceed 60hr/week for 4+ consecutive weeks — BURNOUT ALERT

ENGAGEMENT:
- Engagement Score: 72/100 (+5 pts after Q3 wellness initiative)
- eNPS: +18

RECRUITMENT:
- Time to Fill: 42 days (improved from 45 — target hit)
- Credentialing Compliance: 89.3% (up from 87.2%)
- Hiring bottleneck: Credentialing in rural communities (+15% increase in time-to-fill)

FLIGHT RISK — Top Departments by Risk Score (0-100):
- Emergency: 69 (Critical factors: Workload 91, Compensation 82, Work-Life 78)
- ICU: 68 (Critical factors: Workload 88, Compensation 79, Work-Life 70)
- Mental Health: 62 (Critical factors: Workload 85, Work-Life 65)
- Surgery: 58
- Oncology: 59
- Orthopedics: 45
- Allied Health: 51
- Radiology: 42
- Admin: 36

HIGHEST RISK EMPLOYEES (90-day attrition probability):
1. J. Martinez, RN (Emergency) — 92% risk — Compensation gap + OT overload, tenure 5.2 yrs
2. T. Chen, RN (ICU) — 88% risk — Career ceiling & burnout, tenure 3.8 yrs
3. A. Smith, RN (Mental Health) — 85% risk — Workload & schedule conflict, tenure 2.1 yrs
4. D. Nguyen, LPN (Emergency) — 81% risk — Below-market compensation, tenure 4.6 yrs
5. K. Okonkwo, RT (ICU) — 78% risk — Management relationship issues, tenure 1.9 yrs

BUDGET:
- Total HR Budget: $1.2B
- Overtime Budget: $10.6M (currently $12.4M — $1.8M over)
- Training & Development: $4.2M
- Recruitment Marketing: $1.8M
`;

const SYSTEM_PROMPT = `${HR_DATA_CONTEXT}

=== RESPONSE FORMAT ===

You MUST respond with valid JSON in exactly this format:
{
  "content": "Your analysis in markdown format. Use **bold** for emphasis. Use bullet points (•) for lists.",
  "kpis": [
    {"label": "Metric Name", "value": "42%", "change": "+2.1%", "positive": true}
  ],
  "chart": {
    "type": "bar",
    "title": "Chart Title",
    "data": [{"name": "Category A", "value": 100}, {"name": "Category B", "value": 200}],
    "dataKey": "value",
    "nameKey": "name",
    "color": "#f97316"
  },
  "suggestions": ["Follow-up question 1?", "Follow-up question 2?", "Follow-up question 3?"]
}

Rules:
1. Always include "content" with rich analysis
2. Include "kpis" (2-4 relevant metrics) when the question is about specific metrics
3. Include "chart" data when visual representation would help (optional)
4. Always include 2-3 "suggestions" for follow-up questions
5. Use real numbers from the data above — NEVER make up statistics
6. Be concise but insightful — highlight the WHY behind trends
7. If asked about something not in the data, say so clearly rather than inventing numbers
8. Format content with **bold** headers and • bullet points
`;

// ── API Key Management ──────────────────────────────────────────────────────

const STORAGE_KEY = 'gemini-api-key';

export function getApiKey(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setApiKey(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, key);
  } catch {
    // silently fail in environments without localStorage
  }
}

export function clearApiKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

// ── Fallback Responses ──────────────────────────────────────────────────────

const FALLBACK_RESPONSES: Record<string, GeminiResponse> = {
  overtime: {
    content: `**Overtime Analysis — FY 2026 YTD**\n\nOvertime hours have reached **2.08M hours** (+12.4% YoY), with total cost hitting **$12.4M** — $1.8M over budget.\n\n**Root Causes:**\n• North Zone Emergency accounts for 520K hours (highest)\n• 142 open FTE positions driving forced overtime\n• 23% of Emergency staff exceeding 60hr/week for 4+ consecutive weeks\n\n**Recommendation:** Implement mandatory rest periods and engage locum nurses for North Zone immediately.`,
    kpis: [
      { label: 'Total OT Hours', value: '2.08M', change: '+12.4%', positive: false },
      { label: 'OT Cost YTD', value: '$12.4M', change: '+8.2%', positive: false },
      { label: 'High-Risk Units', value: '14', change: '+3', positive: false },
      { label: 'Budget Variance', value: '-$1.8M', change: 'Over', positive: false },
    ],
    chart: { type: 'bar', data: [{ name: 'North', value: 520 }, { name: 'Edmonton', value: 380 }, { name: 'Calgary', value: 340 }, { name: 'Central', value: 210 }, { name: 'South', value: 130 }], dataKey: 'value', nameKey: 'name', title: 'OT Hours by Zone (000s)', color: '#f97316' },
    suggestions: ['What are the staffing gaps by unit?', 'Compare to last year\'s overtime', 'Show burnout risk by department'],
  },
  attrition: {
    content: `**Attrition Analysis — FY 2026 YTD**\n\nOverall attrition is **8.7%** (improved from 9.1%). However, **clinical leadership voluntary turnover at 15.2%** is a critical concern — double the org average.\n\n**Key Drivers:**\n• Compensation gaps: -12% vs market for clinical lead roles\n• Limited career progression pathways\n• Burnout from sustained overtime demands\n\n**Immediate Action:** Retention interviews for all clinical leads with >3 years tenure.`,
    kpis: [
      { label: 'Overall Attrition', value: '8.7%', change: '-0.4%', positive: true },
      { label: 'Clinical Lead', value: '15.2%', change: '+2.1%', positive: false },
      { label: 'Retention Rate', value: '91.3%', change: '+0.4%', positive: true },
      { label: 'Open Roles', value: '142 FTE', change: '+18', positive: false },
    ],
    suggestions: ['Which departments have highest turnover?', 'What is the cost of attrition?', 'Show flight risk by department'],
  },
  default: {
    content: `**Analysis Summary**\n\nBased on the current data, here are the key metrics:\n\n• **Headcount:** 112,500 FTE (+2.1% YoY)\n• **Attrition:** 8.7% overall, with clinical leadership at 15.2%\n• **Overtime:** $12.4M spent, $1.8M over budget\n• **Engagement:** 72/100 (+5 pts)\n\nPlease ask about a specific area for deeper analysis.`,
    kpis: [
      { label: 'Headcount', value: '112,500', change: '+2.1%', positive: true },
      { label: 'Attrition', value: '8.7%', change: '-0.4%', positive: true },
      { label: 'OT Cost', value: '$12.4M', change: '+8.2%', positive: false },
      { label: 'Engagement', value: '72/100', change: '+5 pts', positive: true },
    ],
    suggestions: ['Show me overtime trends', 'What is our attrition risk?', 'Which departments need attention?'],
  },
};

function getFallbackResponse(query: string): GeminiResponse {
  const q = query.toLowerCase();
  if (q.includes('overtime') || q.includes(' ot ') || q.includes('hours')) return FALLBACK_RESPONSES.overtime;
  if (q.includes('attrition') || q.includes('turnover') || q.includes('retention')) return FALLBACK_RESPONSES.attrition;
  return FALLBACK_RESPONSES.default;
}

// ── Gemini API Call ─────────────────────────────────────────────────────────

export async function askGemini(userQuery: string): Promise<GeminiResponse> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return getFallbackResponse(userQuery);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Question: ${userQuery}` }],
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
          },
        }),
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!response.ok) {
      console.warn(`Gemini API error: ${response.status}`);
      if (response.status === 400 || response.status === 403) {
        clearApiKey(); // invalid key
      }
      return getFallbackResponse(userQuery);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return getFallbackResponse(userQuery);
    }

    // Parse the JSON response
    const parsed = JSON.parse(text) as GeminiResponse;

    // Validate required fields
    if (!parsed.content || typeof parsed.content !== 'string') {
      return getFallbackResponse(userQuery);
    }

    return {
      content: parsed.content,
      kpis: Array.isArray(parsed.kpis) ? parsed.kpis : undefined,
      chart: parsed.chart && parsed.chart.data ? parsed.chart : undefined,
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : ['Tell me more', 'Show me the trends'],
    };
  } catch (err) {
    console.warn('Gemini API call failed, using fallback:', err);
    return getFallbackResponse(userQuery);
  }
}
