import { COMMODITY_TYPE, INVENTORY_TYPE, LOT_STATUS, PRICING_STRATEGY } from '@fincava/shared';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  COMMODITY_TYPE_LABELS,
  INVENTORY_TYPE_LABELS,
  PRICING_STRATEGY_LABELS,
} from '../../lib/adminLabels.js';
import {
  createAdminLot,
  deleteAdminLot,
  deleteLotImage,
  fetchAdminLot,
  updateAdminLot,
  uploadLotImage,
  type AdminLot,
  type LotImage,
} from '../../lib/adminApi.js';
import { usePageTitle } from '../../lib/usePageTitle.js';
import { LOT_STATUS_LABELS } from '../../components/StatusBadge.js';

const inputClasses =
  'w-full mt-1.5 text-sm bg-fc-paper text-fc-ink border border-fc-border-strong rounded-fc-md px-3 py-2.5 box-border';

function arrayToText(values: string[]): string {
  return values.join(', ');
}

function textToArray(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

type FormState = Record<string, string | boolean | string[]>;

const EMPTY_FORM: FormState = {
  lotCode: '',
  title: '',
  commodityType: 'GREEN_COFFEE',
  inventoryType: 'FINCAVA_OWNED',
  status: 'COMING_SOON',
  visible: true,
  variety: '',
  process: '',
  region: '',
  farm: '',
  producer: '',
  altitude: '',
  harvestWindow: '',
  availableKg: '',
  cupScore: '',
  moisture: '',
  waterActivity: '',
  screenSize: '',
  tastingNotes: '',
  certifications: [],
  exportReadiness: '',
  sampleAvailable: false,
  pricingStrategy: 'RFQ_ONLY',
  currency: 'USD',
  pricePerKg: '',
  priceRangeLowPerKg: '',
  priceRangeHighPerKg: '',
  incoterm: '',
  priceNotesPublic: '',
  priceNotesInternal: '',
};

function lotToForm(lot: AdminLot): FormState {
  return {
    lotCode: lot.lotCode,
    title: lot.title,
    commodityType: lot.commodityType,
    inventoryType: lot.inventoryType,
    status: lot.status,
    visible: lot.visible,
    variety: lot.variety,
    process: lot.process,
    region: lot.region,
    farm: lot.farm ?? '',
    producer: lot.producer ?? '',
    altitude: lot.altitude ?? '',
    harvestWindow: lot.harvestWindow ?? '',
    availableKg: lot.availableKg ?? '',
    cupScore: lot.cupScore ?? '',
    moisture: lot.moisture ?? '',
    waterActivity: lot.waterActivity ?? '',
    screenSize: lot.screenSize ?? '',
    tastingNotes: lot.tastingNotes ?? '',
    certifications: lot.certifications,
    exportReadiness: lot.exportReadiness ?? '',
    sampleAvailable: lot.sampleAvailable,
    pricingStrategy: lot.pricingStrategy,
    currency: lot.currency,
    pricePerKg: lot.pricePerKg ?? '',
    priceRangeLowPerKg: lot.priceRangeLowPerKg ?? '',
    priceRangeHighPerKg: lot.priceRangeHighPerKg ?? '',
    incoterm: lot.incoterm ?? '',
    priceNotesPublic: lot.priceNotesPublic ?? '',
    priceNotesInternal: lot.priceNotesInternal ?? '',
  };
}

function numOrUndefined(v: string): number | undefined {
  const trimmed = v.trim();
  return trimmed === '' ? undefined : Number(trimmed);
}

export default function AdminLotForm() {
  const params = useParams<{ lotCode?: string }>();
  const isCreate = !params.lotCode;
  const navigate = useNavigate();
  usePageTitle(isCreate ? 'Admin — New Lot' : `Admin — Edit ${params.lotCode}`);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [images, setImages] = useState<LotImage[]>([]);
  const [loading, setLoading] = useState(!isCreate);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreate || !params.lotCode) return;
    fetchAdminLot(params.lotCode)
      .then((lot) => {
        setForm(lotToForm(lot));
        setImages(lot.images);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : 'Could not load this lot. Refresh the page and try again.',
        );
        setLoading(false);
      });
  }, [isCreate, params.lotCode]);

  function set<K extends string>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const payload = {
        lotCode: form['lotCode'] as string,
        title: form['title'] as string,
        commodityType: form['commodityType'] as string,
        inventoryType: form['inventoryType'] as string,
        status: form['status'] as string,
        visible: form['visible'] as boolean,
        variety: form['variety'] as string,
        process: form['process'] as string,
        region: form['region'] as string,
        farm: (form['farm'] as string) || undefined,
        producer: (form['producer'] as string) || undefined,
        altitude: (form['altitude'] as string) || undefined,
        harvestWindow: (form['harvestWindow'] as string) || undefined,
        availableKg: numOrUndefined(form['availableKg'] as string),
        cupScore: numOrUndefined(form['cupScore'] as string),
        moisture: numOrUndefined(form['moisture'] as string),
        waterActivity: numOrUndefined(form['waterActivity'] as string),
        screenSize: (form['screenSize'] as string) || undefined,
        tastingNotes: (form['tastingNotes'] as string) || undefined,
        certifications: form['certifications'] as string[],
        exportReadiness: (form['exportReadiness'] as string) || undefined,
        sampleAvailable: form['sampleAvailable'] as boolean,
        pricingStrategy: form['pricingStrategy'] as string,
        currency: form['currency'] as string,
        pricePerKg: numOrUndefined(form['pricePerKg'] as string),
        priceRangeLowPerKg: numOrUndefined(form['priceRangeLowPerKg'] as string),
        priceRangeHighPerKg: numOrUndefined(form['priceRangeHighPerKg'] as string),
        incoterm: (form['incoterm'] as string) || undefined,
        priceNotesPublic: (form['priceNotesPublic'] as string) || undefined,
        priceNotesInternal: (form['priceNotesInternal'] as string) || undefined,
      };

      if (isCreate) {
        const created = await createAdminLot(payload);
        navigate(`/admin/lots/${encodeURIComponent(created.lotCode)}`);
        return;
      }

      await updateAdminLot(params.lotCode as string, payload);
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Changes could not be saved. Review the form and try again.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!params.lotCode) return;
    if (!confirm(`Delete lot ${params.lotCode}? This cannot be undone.`)) return;
    try {
      await deleteAdminLot(params.lotCode);
      navigate('/admin/lots');
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'The lot could not be deleted. It may be linked to existing requests.',
      );
    }
  }

  async function handleUpload() {
    if (!file || !params.lotCode) return;
    setUploading(true);
    setUploadError('');
    try {
      const img = await uploadLotImage(params.lotCode, file, altText.trim() || undefined);
      setImages((prev) => [...prev, img]);
      setFile(null);
      setAltText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setUploadError(
        err instanceof Error
          ? err.message
          : 'The image could not be uploaded. Check the file and try again.',
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteImage(publicId: string) {
    if (!params.lotCode) return;
    if (!confirm('Delete this image?')) return;
    try {
      await deleteLotImage(params.lotCode, publicId);
      setImages((prev) => prev.filter((img) => img.publicId !== publicId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'This image could not be deleted. Try again.');
    }
  }

  if (loading) return <p className="text-sm text-fc-ink-3">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display font-medium text-2xl text-fc-ink mb-6">
        {isCreate ? 'New lot' : `Edit ${params.lotCode}`}
      </h1>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-fc-md px-3 py-2 mb-4">
          {error}
        </p>
      )}
      {saved && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-fc-md px-3 py-2 mb-4">
          Saved.
        </p>
      )}

      <div className="border border-fc-line rounded-fc-lg bg-fc-white p-6 space-y-4">
        <h2 className="text-sm font-semibold text-fc-ink">Identity</h2>
        <div className="grid grid-cols-2 gap-4">
          <label className="text-xs text-fc-ink-2">
            Lot code *
            <input
              className={inputClasses}
              value={form['lotCode'] as string}
              disabled={!isCreate}
              onChange={(e) => set('lotCode', e.target.value)}
            />
          </label>
          <label className="text-xs text-fc-ink-2">
            Title *
            <input
              className={inputClasses}
              value={form['title'] as string}
              onChange={(e) => set('title', e.target.value)}
            />
          </label>
          <label className="text-xs text-fc-ink-2">
            Commodity type
            <select
              className={inputClasses}
              value={form['commodityType'] as string}
              onChange={(e) => set('commodityType', e.target.value)}
            >
              {COMMODITY_TYPE.map((v) => (
                <option key={v} value={v}>
                  {COMMODITY_TYPE_LABELS[v] ?? v}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-fc-ink-2">
            Inventory type *
            <select
              className={inputClasses}
              value={form['inventoryType'] as string}
              onChange={(e) => set('inventoryType', e.target.value)}
            >
              {INVENTORY_TYPE.map((v) => (
                <option key={v} value={v}>
                  {INVENTORY_TYPE_LABELS[v] ?? v}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-fc-ink-2">
            Status *
            <select
              className={inputClasses}
              value={form['status'] as string}
              onChange={(e) => set('status', e.target.value)}
            >
              {LOT_STATUS.map((v) => (
                <option key={v} value={v}>
                  {LOT_STATUS_LABELS[v] ?? v}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-fc-ink-2 flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={form['visible'] as boolean}
              onChange={(e) => set('visible', e.target.checked)}
            />
            Visible on public site — unchecked hides this lot from buyers without deleting it
          </label>
        </div>

        <h2 className="text-sm font-semibold text-fc-ink pt-2">Passport</h2>
        <div className="grid grid-cols-2 gap-4">
          <label className="text-xs text-fc-ink-2">
            Variety *
            <input
              className={inputClasses}
              value={form['variety'] as string}
              onChange={(e) => set('variety', e.target.value)}
            />
          </label>
          <label className="text-xs text-fc-ink-2">
            Process *
            <input
              className={inputClasses}
              value={form['process'] as string}
              onChange={(e) => set('process', e.target.value)}
            />
          </label>
          <label className="text-xs text-fc-ink-2">
            Region *
            <input
              className={inputClasses}
              value={form['region'] as string}
              onChange={(e) => set('region', e.target.value)}
            />
          </label>
          <label className="text-xs text-fc-ink-2">
            Farm
            <input
              className={inputClasses}
              value={form['farm'] as string}
              onChange={(e) => set('farm', e.target.value)}
            />
          </label>
          <label className="text-xs text-fc-ink-2">
            Producer
            <input
              className={inputClasses}
              value={form['producer'] as string}
              onChange={(e) => set('producer', e.target.value)}
            />
          </label>
          <label className="text-xs text-fc-ink-2">
            Altitude
            <input
              className={inputClasses}
              value={form['altitude'] as string}
              onChange={(e) => set('altitude', e.target.value)}
            />
          </label>
          <label className="text-xs text-fc-ink-2">
            Harvest window
            <input
              className={inputClasses}
              value={form['harvestWindow'] as string}
              onChange={(e) => set('harvestWindow', e.target.value)}
            />
          </label>
          <label className="text-xs text-fc-ink-2">
            Available kg
            <input
              className={inputClasses}
              value={form['availableKg'] as string}
              onChange={(e) => set('availableKg', e.target.value)}
            />
          </label>
          <label className="text-xs text-fc-ink-2">
            Cup score
            <input
              className={inputClasses}
              value={form['cupScore'] as string}
              onChange={(e) => set('cupScore', e.target.value)}
            />
          </label>
          <label className="text-xs text-fc-ink-2">
            Moisture
            <input
              className={inputClasses}
              value={form['moisture'] as string}
              onChange={(e) => set('moisture', e.target.value)}
            />
          </label>
          <label className="text-xs text-fc-ink-2">
            Water activity
            <input
              className={inputClasses}
              value={form['waterActivity'] as string}
              onChange={(e) => set('waterActivity', e.target.value)}
            />
          </label>
          <label className="text-xs text-fc-ink-2">
            Screen size
            <input
              className={inputClasses}
              value={form['screenSize'] as string}
              onChange={(e) => set('screenSize', e.target.value)}
            />
          </label>
          <label className="text-xs text-fc-ink-2">
            Export readiness
            <input
              className={inputClasses}
              value={form['exportReadiness'] as string}
              onChange={(e) => set('exportReadiness', e.target.value)}
            />
          </label>
          <label className="text-xs text-fc-ink-2 flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={form['sampleAvailable'] as boolean}
              onChange={(e) => set('sampleAvailable', e.target.checked)}
            />
            Sample available
          </label>
        </div>
        <label className="text-xs text-fc-ink-2 block">
          Tasting notes
          <textarea
            className={inputClasses}
            rows={2}
            value={form['tastingNotes'] as string}
            onChange={(e) => set('tastingNotes', e.target.value)}
          />
        </label>
        <label className="text-xs text-fc-ink-2 block">
          Certifications (comma-separated)
          <input
            className={inputClasses}
            value={arrayToText(form['certifications'] as string[])}
            onChange={(e) => set('certifications', textToArray(e.target.value))}
          />
        </label>

        <h2 className="text-sm font-semibold text-fc-ink pt-2">Pricing</h2>
        <div className="grid grid-cols-2 gap-4">
          <label className="text-xs text-fc-ink-2">
            Pricing strategy
            <select
              className={inputClasses}
              value={form['pricingStrategy'] as string}
              onChange={(e) => {
                const next = e.target.value;
                set('pricingStrategy', next);
                // §7: INVITE_ONLY lots default to hidden on creation — mirror
                // the server's default here so the checkbox reflects it
                // before save, not just after a reload.
                if (isCreate) set('visible', next !== 'INVITE_ONLY');
              }}
            >
              {PRICING_STRATEGY.map((v) => (
                <option key={v} value={v}>
                  {PRICING_STRATEGY_LABELS[v] ?? v}
                </option>
              ))}
            </select>
            <span className="block mt-1 text-fc-ink-3 normal-case">
              Controls what buyers see before signing in. "Invite only" hides the lot from the
              public catalog by default on creation — flip "Visible on public site" above to publish
              it anyway.
            </span>
          </label>
          <label className="text-xs text-fc-ink-2">
            Currency
            <input
              className={inputClasses}
              value={form['currency'] as string}
              onChange={(e) => set('currency', e.target.value)}
            />
          </label>
          <label className="text-xs text-fc-ink-2">
            Price per kg
            <input
              className={inputClasses}
              value={form['pricePerKg'] as string}
              onChange={(e) => set('pricePerKg', e.target.value)}
            />
          </label>
          <label className="text-xs text-fc-ink-2">
            Incoterm
            <input
              className={inputClasses}
              value={form['incoterm'] as string}
              onChange={(e) => set('incoterm', e.target.value)}
            />
          </label>
          <label className="text-xs text-fc-ink-2">
            Price range low/kg
            <input
              className={inputClasses}
              value={form['priceRangeLowPerKg'] as string}
              onChange={(e) => set('priceRangeLowPerKg', e.target.value)}
            />
          </label>
          <label className="text-xs text-fc-ink-2">
            Price range high/kg
            <input
              className={inputClasses}
              value={form['priceRangeHighPerKg'] as string}
              onChange={(e) => set('priceRangeHighPerKg', e.target.value)}
            />
          </label>
        </div>
        <label className="text-xs text-fc-ink-2 block">
          Price notes (public)
          <textarea
            className={inputClasses}
            rows={2}
            value={form['priceNotesPublic'] as string}
            onChange={(e) => set('priceNotesPublic', e.target.value)}
          />
        </label>
        <label className="text-xs text-fc-ink-2 block">
          Price notes (internal — never shown to buyers)
          <textarea
            className={inputClasses}
            rows={2}
            value={form['priceNotesInternal'] as string}
            onChange={(e) => set('priceNotesInternal', e.target.value)}
          />
        </label>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-fc-sage-deep text-fc-white text-sm font-medium px-5 py-2 rounded-fc-md hover:bg-fc-sage-deep/90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : isCreate ? 'Create lot' : 'Save changes'}
          </button>
          {!isCreate && (
            <button
              type="button"
              onClick={handleDelete}
              className="text-sm text-red-600 hover:text-red-800 underline underline-offset-2"
            >
              Delete lot
            </button>
          )}
        </div>
      </div>

      {!isCreate && (
        <div className="border border-fc-line rounded-fc-lg bg-fc-white p-6 mt-6">
          <h2 className="text-sm font-semibold text-fc-ink mb-3">Images ({images.length})</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {images.map((img) => (
              <div key={img.publicId} className="relative">
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-28 object-cover rounded-fc-md border border-fc-line"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(img.publicId)}
                  className="mt-1 text-[10px] text-red-500 hover:text-red-700 underline"
                >
                  Delete
                </button>
              </div>
            ))}
            {images.length === 0 && (
              <p className="text-sm text-fc-ink-3 col-span-3">No images yet.</p>
            )}
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs text-fc-ink-2 block">
                Image file (JPEG, PNG, WebP · max 5MB)
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="block mt-1.5 text-sm"
                />
              </label>
            </div>
            <div className="flex-1">
              <label className="text-xs text-fc-ink-2 block">
                Alt text
                <input
                  className={inputClasses}
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                />
              </label>
            </div>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || uploading}
              className="bg-fc-ink text-fc-white text-sm font-medium px-4 py-2.5 rounded-fc-md disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
          {uploadError && <p className="text-xs text-red-600 mt-2">{uploadError}</p>}
        </div>
      )}
    </div>
  );
}
