const API_BASE = '/api';

export async function fetchDayAheadForecast(deliveryDate, cutoffHour = 11, cutoffMinute = 0) {
  const url = `${API_BASE}/forecasts/day-ahead?deliveryDate=${deliveryDate}&cutoffHour=${cutoffHour}&cutoffMinute=${cutoffMinute}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch day-ahead forecast: ${res.statusText}`);
  return res.json();
}

export async function fetchForecastEvolution(deliveryDate, cutoffHour = 11, cutoffMinute = 0) {
  const url = `${API_BASE}/forecasts/evolution?deliveryDate=${deliveryDate}&cutoffHour=${cutoffHour}&cutoffMinute=${cutoffMinute}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch forecast evolution: ${res.statusText}`);
  return res.json();
}

export async function fetchAccuracyMetrics(startDate = '2026-01-01', endDate = '2026-01-31', cutoffHour = 11) {
  const url = `${API_BASE}/evaluation/metrics?startDate=${startDate}&endDate=${endDate}&cutoffHour=${cutoffHour}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch accuracy metrics: ${res.statusText}`);
  return res.json();
}

export async function fetchHourlyProfile(startDate = '2026-01-01', endDate = '2026-01-31', cutoffHour = 11) {
  const url = `${API_BASE}/evaluation/hourly-profile?startDate=${startDate}&endDate=${endDate}&cutoffHour=${cutoffHour}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch hourly profile: ${res.statusText}`);
  return res.json();
}

export async function fetchDailyBreakdown(startDate = '2026-01-01', endDate = '2026-01-31', cutoffHour = 11) {
  const url = `${API_BASE}/evaluation/daily-breakdown?startDate=${startDate}&endDate=${endDate}&cutoffHour=${cutoffHour}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch daily breakdown: ${res.statusText}`);
  return res.json();
}

export async function fetchErrorDistribution(startDate = '2026-01-01', endDate = '2026-01-31', cutoffHour = 11, bins = 15) {
  const url = `${API_BASE}/evaluation/distribution?startDate=${startDate}&endDate=${endDate}&cutoffHour=${cutoffHour}&bins=${bins}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch distribution: ${res.statusText}`);
  return res.json();
}

export async function simulateProcurement(params) {
  const url = `${API_BASE}/procurement/simulate`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error(`Simulation failed: ${res.statusText}`);
  return res.json();
}

export async function fetchSystemStatus() {
  const url = `${API_BASE}/system/status`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch system status: ${res.statusText}`);
  return res.json();
}

export async function fetchSampleDates() {
  const url = `${API_BASE}/system/sample-dates`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch sample dates: ${res.statusText}`);
  return res.json();
}
