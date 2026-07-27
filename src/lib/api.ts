const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ecowas-api.onrender.com";

export interface PlatformStats {
  countries: number;
  indicators: number;
  observations: number;
  year_range: { min: number; max: number };
  sources: number;
  generated_at: string;
}

export interface Indicator {
  metric_key: string;
  name_en: string;
  name_fr: string;
  category: string;
  unit: string;
  frequency: string;
  source: string;
  observations_count: number;
  year_range: { min: number | null; max: number | null };
}

export interface Country {
  code: string;
  name_en: string;
  name_fr: string;
  capital: string;
  currency_code: string;
  currency_name: string;
  zone: string | null;
  language: string;
}

export interface EconomyData {
  country_code: string;
  country_name: string;
  indicators: Record<string, { value: number; year: number; source: string }>;
}

export interface DataPoint {
  country_code: string;
  metric_key: string;
  year: number;
  value: number;
  source: string;
  source_url: string;
}

async function apiFetch<T>(path: string, options?: { revalidate?: number }): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: options?.revalidate ?? 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getPlatformStats(): Promise<PlatformStats | null> {
  return apiFetch<PlatformStats>("/v1/platform/stats", { revalidate: 300 });
}

export async function getIndicators(params?: { category?: string; limit?: number }): Promise<{ data: Indicator[]; total: number } | null> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set("category", params.category);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const qs = searchParams.toString();
  return apiFetch(`/v1/indicators${qs ? `?${qs}` : ""}`, { revalidate: 3600 });
}

export async function getCountries(): Promise<Country[] | null> {
  return apiFetch<Country[]>("/v1/countries", { revalidate: 86400 });
}

export async function getEconomy(countryCode: string): Promise<EconomyData | null> {
  return apiFetch<EconomyData>(`/v1/economy/${countryCode}`, { revalidate: 3600 });
}

export async function getData(params: {
  country?: string;
  indicator?: string;
  year?: number;
  latest?: boolean;
  category?: string;
}): Promise<{ data: DataPoint[]; total: number } | null> {
  const searchParams = new URLSearchParams();
  if (params.country) searchParams.set("country", params.country);
  if (params.indicator) searchParams.set("indicator", params.indicator);
  if (params.year) searchParams.set("year", String(params.year));
  if (params.latest) searchParams.set("latest", "true");
  if (params.category) searchParams.set("category", params.category);
  return apiFetch(`/v1/data?${searchParams.toString()}`, { revalidate: 3600 });
}

export { API_URL };
