// All admin endpoints are session-cookie gated and return 404 (not 401) when
// unauthenticated, per execution-spec §4/§9 ("don't advertise the surface").
// AdminNotFoundError lets callers distinguish that from an ordinary
// not-found (e.g. a deleted lot) when they need to.
export class AdminNotFoundError extends Error {}

async function adminRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/admin${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    credentials: 'include',
  });
  if (res.status === 404) {
    throw new AdminNotFoundError('Not found');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

// ── Auth ─────────────────────────────────────────────────────────────────

export function adminLogin(password: string): Promise<{ status: string }> {
  return adminRequest('/login', { method: 'POST', body: JSON.stringify({ password }) });
}

export function adminLogout(): Promise<{ status: string }> {
  return adminRequest('/logout', { method: 'POST' });
}

// ── Dashboard ────────────────────────────────────────────────────────────

export interface AdminDashboard {
  windowDays: number;
  newRfqs: number;
  newSampleRequests: number;
  newSourcingRequests: number;
  newVerificationRequests: number;
  newRegistrations: number;
  lotsByStatus: Array<{ status: string; count: number }>;
}

export function fetchAdminDashboard(): Promise<AdminDashboard> {
  return adminRequest('/dashboard');
}

// ── Lots ─────────────────────────────────────────────────────────────────

export interface AdminLot {
  id: string;
  lotCode: string;
  title: string;
  commodityType: string;
  inventoryType: string;
  status: string;
  visible: boolean;
  variety: string;
  process: string;
  region: string;
  farm: string | null;
  producer: string | null;
  altitude: string | null;
  harvestDate: string | null;
  harvestWindow: string | null;
  availableKg: string | null;
  cupScore: string | null;
  moisture: string | null;
  waterActivity: string | null;
  screenSize: string | null;
  tastingNotes: string | null;
  certifications: string[];
  exportReadiness: string | null;
  sampleAvailable: boolean;
  images: Array<{ url: string; publicId: string; alt: string }>;
  pricingStrategy: string;
  currency: string;
  pricePerKg: string | null;
  priceRangeLowPerKg: string | null;
  priceRangeHighPerKg: string | null;
  incoterm: string | null;
  priceNotesPublic: string | null;
  priceNotesInternal: string | null;
  createdAt: string;
  updatedAt: string;
}

// Distinct from AdminLot — that type represents server-returned display
// values (numeric fields as strings, per Drizzle's numeric-column convention);
// this represents what the create/update endpoints actually accept (plain
// numbers), matching shared/src/schemas/adminLot.ts.
export interface AdminLotInput {
  lotCode: string;
  title: string;
  commodityType: string;
  inventoryType: string;
  status: string;
  visible: boolean;
  variety: string;
  process: string;
  region: string;
  farm?: string;
  producer?: string;
  altitude?: string;
  harvestWindow?: string;
  availableKg?: number;
  cupScore?: number;
  moisture?: number;
  waterActivity?: number;
  screenSize?: string;
  tastingNotes?: string;
  certifications: string[];
  exportReadiness?: string;
  sampleAvailable: boolean;
  pricingStrategy: string;
  currency: string;
  pricePerKg?: number;
  priceRangeLowPerKg?: number;
  priceRangeHighPerKg?: number;
  incoterm?: string;
  priceNotesPublic?: string;
  priceNotesInternal?: string;
}

export function fetchAdminLots(): Promise<AdminLot[]> {
  return adminRequest('/lots');
}

export function fetchAdminLot(lotCode: string): Promise<AdminLot> {
  return adminRequest(`/lots/${encodeURIComponent(lotCode)}`);
}

export function createAdminLot(input: Partial<AdminLotInput>): Promise<AdminLot> {
  return adminRequest('/lots', { method: 'POST', body: JSON.stringify(input) });
}

export function updateAdminLot(lotCode: string, input: Partial<AdminLotInput>): Promise<AdminLot> {
  return adminRequest(`/lots/${encodeURIComponent(lotCode)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteAdminLot(lotCode: string): Promise<{ deleted: string }> {
  return adminRequest(`/lots/${encodeURIComponent(lotCode)}`, { method: 'DELETE' });
}

export interface LotImage {
  url: string;
  publicId: string;
  alt: string;
}

export async function uploadLotImage(lotCode: string, file: File, alt?: string): Promise<LotImage> {
  const formData = new FormData();
  formData.append('image', file);
  if (alt) formData.append('alt', alt);
  const res = await fetch(`/api/admin/lots/${encodeURIComponent(lotCode)}/images`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  if (res.status === 404) throw new AdminNotFoundError('Not found');
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `Upload failed (${res.status})`);
  return body as LotImage;
}

export function deleteLotImage(lotCode: string, publicId: string): Promise<{ deleted: string }> {
  const encoded = btoa(publicId).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return adminRequest(`/lots/${encodeURIComponent(lotCode)}/images/${encoded}`, {
    method: 'DELETE',
  });
}

// ── Buyers ───────────────────────────────────────────────────────────────

export interface AdminBuyerListItem {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  buyerType: string | null;
  country: string | null;
  alertOptIn: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AdminBuyerDetail extends AdminBuyerListItem {
  phone: string | null;
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
  alertCompetitionLots: boolean;
  marketingOptIn: boolean;
  consentTimestamp: string | null;
  internalNotes: string | null;
  rfqs: Array<{
    id: string;
    lotCode: string;
    lotTitle: string;
    requestedVolumeKg: string;
    destinationCountry: string;
    status: string;
    internalNotes: string | null;
    createdAt: string;
  }>;
  sampleRequests: Array<{
    id: string;
    lotCode: string;
    lotTitle: string;
    sampleDestination: string;
    status: string;
    internalNotes: string | null;
    createdAt: string;
  }>;
  sourcingRequests: Array<{
    id: string;
    intendedUse: string;
    requestedVolumeKg: string;
    destinationCountry: string;
    status: string;
    matchedLotId: string | null;
    internalNotes: string | null;
    createdAt: string;
  }>;
}

export function fetchAdminBuyers(): Promise<AdminBuyerListItem[]> {
  return adminRequest('/buyers');
}

export function fetchAdminBuyer(id: string): Promise<AdminBuyerDetail> {
  return adminRequest(`/buyers/${encodeURIComponent(id)}`);
}

export function updateAdminBuyerNotes(
  id: string,
  internalNotes: string,
): Promise<AdminBuyerDetail> {
  return adminRequest(`/buyers/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ internalNotes }),
  });
}

export function deleteAdminBuyer(id: string): Promise<{ deleted: string }> {
  return adminRequest(`/buyers/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// ── Requests queue ───────────────────────────────────────────────────────

export type AdminRequestType = 'rfq' | 'sample' | 'sourcing' | 'verification';

export interface AdminRfqRow {
  id: string;
  buyerName: string | null;
  buyerCompany: string | null;
  buyerEmail: string;
  lotCode: string;
  lotTitle: string;
  requestedVolumeKg: string;
  destinationCountry: string;
  preferredIncoterm: string | null;
  targetDeliveryTimeline: string | null;
  message: string | null;
  status: string;
  internalNotes: string | null;
  createdAt: string;
}

export interface AdminSampleRow {
  id: string;
  buyerName: string | null;
  buyerCompany: string | null;
  buyerEmail: string;
  lotCode: string;
  lotTitle: string;
  sampleDestination: string;
  status: string;
  internalNotes: string | null;
  createdAt: string;
}

export interface AdminSourcingRow {
  id: string;
  buyerName: string | null;
  buyerCompany: string | null;
  buyerEmail: string;
  intendedUse: string;
  requestedVolumeKg: string;
  destinationCountry: string;
  maxBudgetPerKg: string | null;
  budgetCurrency: string;
  additionalNotes: string | null;
  status: string;
  matchedLotId: string | null;
  internalNotes: string | null;
  createdAt: string;
}

export interface AdminVerificationRow {
  id: string;
  requesterName: string;
  requesterEmail: string;
  requesterCompany: string;
  farmOrLotOfInterest: string | null;
  regionOfInterest: string | null;
  message: string | null;
  status: string;
  linkedLotId: string | null;
  internalNotes: string | null;
  createdAt: string;
}

export function fetchAdminRequests<T>(type: AdminRequestType): Promise<T[]> {
  return adminRequest(`/requests?type=${type}`);
}

export function updateAdminRequest(
  type: AdminRequestType,
  id: string,
  update: {
    status?: string;
    internalNotes?: string | null;
    matchedLotId?: string | null;
    linkedLotId?: string | null;
  },
): Promise<unknown> {
  return adminRequest(`/requests/${type}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(update),
  });
}

// ── Market Intelligence ──────────────────────────────────────────────────

export interface MarketIntelligenceNote {
  id: string;
  lotId: string | null;
  variety: string | null;
  process: string | null;
  targetMarkets: string | null;
  demandTrend: string | null;
  estimatedRateLowPerKg: string | null;
  estimatedRateHighPerKg: string | null;
  currency: string;
  comparableOfferings: string | null;
  suggestedBuyerCategories: string | null;
  pricingRecommendation: string | null;
  researchSource: string | null;
  researchDate: string | null;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export function fetchMarketIntelligence(filters?: {
  variety?: string;
  lotId?: string;
}): Promise<MarketIntelligenceNote[]> {
  const params = new URLSearchParams();
  if (filters?.variety) params.set('variety', filters.variety);
  if (filters?.lotId) params.set('lotId', filters.lotId);
  const qs = params.toString();
  return adminRequest(`/market-intelligence${qs ? `?${qs}` : ''}`);
}

// Distinct from MarketIntelligenceNote — that type represents server-returned
// display values (numeric fields as strings); this represents what the
// create/update endpoints accept (plain numbers), matching
// shared/src/schemas/marketIntelligence.ts.
export interface MarketIntelligenceInput {
  lotId?: string;
  variety?: string;
  process?: string;
  targetMarkets?: string;
  demandTrend?: string;
  estimatedRateLowPerKg?: number;
  estimatedRateHighPerKg?: number;
  currency: string;
  comparableOfferings?: string;
  suggestedBuyerCategories?: string;
  pricingRecommendation?: string;
  researchSource?: string;
  internalNotes?: string;
}

export function createMarketIntelligence(
  input: Partial<MarketIntelligenceInput>,
): Promise<MarketIntelligenceNote> {
  return adminRequest('/market-intelligence', { method: 'POST', body: JSON.stringify(input) });
}

export function updateMarketIntelligence(
  id: string,
  input: Partial<MarketIntelligenceInput>,
): Promise<MarketIntelligenceNote> {
  return adminRequest(`/market-intelligence/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteMarketIntelligence(id: string): Promise<{ deleted: string }> {
  return adminRequest(`/market-intelligence/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// ── Alert Outreach ───────────────────────────────────────────────────────

export interface AlertOutreachFilter {
  variety?: string;
  process?: string;
  scoreMin?: number;
  scoreMax?: number;
  certification?: string;
  region?: string;
}

export interface AlertOutreachBuyer {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  buyerType: string | null;
  country: string | null;
  preferredVarieties: string[];
  preferredProcesses: string[];
  preferredScoreMin: string | null;
  preferredScoreMax: string | null;
  targetOrigins: string[];
  certificationsNeeded: string[];
}

function filterToParams(filter: AlertOutreachFilter): string {
  const params = new URLSearchParams();
  if (filter.variety) params.set('variety', filter.variety);
  if (filter.process) params.set('process', filter.process);
  if (filter.scoreMin !== undefined) params.set('scoreMin', String(filter.scoreMin));
  if (filter.scoreMax !== undefined) params.set('scoreMax', String(filter.scoreMax));
  if (filter.certification) params.set('certification', filter.certification);
  if (filter.region) params.set('region', filter.region);
  return params.toString();
}

export function fetchAlertOutreach(
  filter: AlertOutreachFilter,
): Promise<{ filter: AlertOutreachFilter; count: number; buyers: AlertOutreachBuyer[] }> {
  const qs = filterToParams(filter);
  return adminRequest(`/alert-outreach${qs ? `?${qs}` : ''}`);
}

export function alertOutreachExportUrl(filter: AlertOutreachFilter): string {
  const qs = filterToParams(filter);
  return `/api/admin/alert-outreach/export.csv${qs ? `?${qs}` : ''}`;
}
