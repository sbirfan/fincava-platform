import type { PricingDisplay } from '@fincava/shared';

export interface ApiLot {
  lotCode: string;
  title: string;
  variety: string;
  process: string;
  region: string;
  altitude: string | null;
  status: string;
  cupScore: string | null;
  tastingNotes: string | null;
  harvestWindow: string | null;
  images: Array<{ url: string; publicId: string; alt: string }>;
  sampleAvailable: boolean;
  pricing: PricingDisplay;
  // Present only when the response is gated (authenticated buyer) — the
  // partial passport UI treats their absence as "locked".
  farm?: string | null;
  producer?: string | null;
  harvestDate?: string | null;
  availableKg?: string | null;
  moisture?: string | null;
  waterActivity?: string | null;
  screenSize?: string | null;
  certifications?: string[];
  exportReadiness?: string | null;
  incoterm?: string | null;
  priceNotesPublic?: string | null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function fetchLots(): Promise<ApiLot[]> {
  return request<ApiLot[]>('/lots');
}

export function fetchLot(lotCode: string): Promise<ApiLot> {
  return request<ApiLot>(`/lots/${encodeURIComponent(lotCode)}`);
}

export interface VerificationRequestPayload {
  requesterName: string;
  requesterEmail: string;
  requesterCompany: string;
  requesterPhone?: string;
  country?: string;
  farmOrLotOfInterest?: string;
  regionOfInterest?: string;
  message?: string;
  website?: string; // honeypot — always sent empty by real users
}

export function submitVerificationRequest(
  payload: VerificationRequestPayload,
): Promise<{ status: string }> {
  return request('/verification-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface OtpRequestPayload {
  email: string;
  website?: string; // honeypot — always sent empty by real users
}

export function requestOtp(payload: OtpRequestPayload): Promise<{ status: string }> {
  return request('/auth/otp/request', { method: 'POST', body: JSON.stringify(payload) });
}

export function verifyOtp(email: string, code: string): Promise<{ isNewProfile: boolean }> {
  return request('/auth/otp/verify', { method: 'POST', body: JSON.stringify({ email, code }) });
}

export function logout(): Promise<{ status: string }> {
  return request('/auth/logout', { method: 'POST' });
}

export interface BuyerProfile {
  id: string;
  email: string;
  emailVerifiedAt: string | null;
  name: string | null;
  company: string | null;
  phone: string | null;
  country: string | null;
  buyerType: string | null;
  website: string | null;
  preferredContactMethod: string | null;
  preferredVarieties: string[];
  preferredProcesses: string[];
  preferredScoreMin: string | null;
  preferredScoreMax: string | null;
  preferredVolumeMinKg: string | null;
  preferredVolumeMaxKg: string | null;
  targetOrigins: string[];
  certificationsNeeded: string[];
  destinationCountries: string[];
  alertOptIn: boolean;
  alertCompetitionLots: boolean;
  marketingOptIn: boolean;
  consentTimestamp: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export function fetchMyProfile(): Promise<BuyerProfile> {
  return request('/me');
}

export type BuyerProfileUpdate = Partial<
  Pick<
    BuyerProfile,
    | 'name'
    | 'company'
    | 'phone'
    | 'country'
    | 'buyerType'
    | 'website'
    | 'preferredContactMethod'
    | 'preferredVarieties'
    | 'preferredProcesses'
    | 'targetOrigins'
    | 'certificationsNeeded'
    | 'destinationCountries'
    | 'alertOptIn'
    | 'alertCompetitionLots'
    | 'marketingOptIn'
  >
> & {
  preferredScoreMin?: number;
  preferredScoreMax?: number;
  preferredVolumeMinKg?: number;
  preferredVolumeMaxKg?: number;
};

export function updateMyProfile(update: BuyerProfileUpdate): Promise<BuyerProfile> {
  return request('/me', { method: 'PATCH', body: JSON.stringify(update) });
}
