import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

interface LotImage {
  url: string;
  publicId: string;
  alt: string;
}

const SESSION_KEY = 'fincava_admin_token';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function adminFetch(path: string, token: string, init?: RequestInit): Promise<Response> {
  return fetch(`/api${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
    credentials: 'include',
  });
}

// ---------------------------------------------------------------------------
// Admin lot image manager — /admin/lots/:lotCode
// ---------------------------------------------------------------------------

export default function AdminLot() {
  const { lotCode } = useParams<{ lotCode: string }>();

  const [token, setToken] = useState<string>(() => sessionStorage.getItem(SESSION_KEY) ?? '');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [images, setImages] = useState<LotImage[]>([]);
  const [loadError, setLoadError] = useState('');

  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Auth ────────────────────────────────────────────────────────────────

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError('');
    sessionStorage.setItem(SESSION_KEY, passwordInput);
    setToken(passwordInput);
    setPasswordInput('');
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    setToken('');
    setImages([]);
    setLoadError('');
  }

  // ── Load images ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!token || !lotCode) return;
    setLoadError('');
    adminFetch(`/admin/lots/${encodeURIComponent(lotCode)}/images`, token)
      .then(async (res) => {
        if (res.status === 401) {
          setAuthError('Wrong admin password');
          sessionStorage.removeItem(SESSION_KEY);
          setToken('');
          return;
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setLoadError(body.error ?? `Failed to load images (${res.status})`);
          return;
        }
        const data = await res.json();
        setImages(data as LotImage[]);
      })
      .catch((err: unknown) => {
        setLoadError(err instanceof Error ? err.message : 'Network error');
      });
  }, [token, lotCode]);

  // ── Upload ───────────────────────────────────────────────────────────────

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !lotCode) return;

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      if (altText.trim()) formData.append('alt', altText.trim());

      const res = await adminFetch(`/admin/lots/${encodeURIComponent(lotCode)}/images`, token, {
        method: 'POST',
        body: formData,
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          setAuthError('Session expired — please log in again');
          sessionStorage.removeItem(SESSION_KEY);
          setToken('');
          return;
        }
        setUploadError(body.error ?? `Upload failed (${res.status})`);
        return;
      }

      const newImage = body as LotImage;
      setImages((prev) => [...prev, newImage]);
      setUploadSuccess(`Uploaded successfully → ${newImage.url}`);
      setFile(null);
      setAltText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Network error during upload');
    } finally {
      setUploading(false);
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────

  async function handleDelete(publicId: string) {
    if (!lotCode) return;
    const encoded = btoa(publicId).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    try {
      const res = await adminFetch(
        `/admin/lots/${encodeURIComponent(lotCode)}/images/${encoded}`,
        token,
        { method: 'DELETE' },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.error ?? `Delete failed (${res.status})`);
        return;
      }
      setImages((prev) => prev.filter((img) => img.publicId !== publicId));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Network error during delete');
    }
  }

  // ── Render: login gate ───────────────────────────────────────────────────

  if (!token) {
    return (
      <div className="max-w-sm mx-auto px-6 py-20">
        <h1 className="font-display font-medium text-xl text-fc-ink mb-6">Admin — Sign in</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="pwd" className="block text-sm text-fc-ink-2 mb-1">
              Admin password
            </label>
            <input
              id="pwd"
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              required
              className="w-full border border-fc-border-strong rounded-fc-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fc-sage-deep"
            />
          </div>
          {authError && <p className="text-xs text-red-600">{authError}</p>}
          <button
            type="submit"
            className="w-full bg-fc-ink text-fc-white text-sm font-medium py-2 rounded-fc-md hover:bg-fc-ink/90 transition-colors"
          >
            Sign in
          </button>
        </form>
      </div>
    );
  }

  // ── Render: image manager ────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-fc-ink-3 font-mono mb-1">{lotCode}</p>
          <h1 className="font-display font-medium text-2xl text-fc-ink">Lot images</h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-fc-ink-3 underline underline-offset-2 hover:text-fc-ink"
        >
          Sign out
        </button>
      </div>

      {/* Current images */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-fc-ink mb-3">Current images ({images.length})</h2>
        {loadError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-fc-md px-3 py-2 mb-4">
            {loadError}
          </p>
        )}
        {images.length === 0 && !loadError ? (
          <p className="text-sm text-fc-ink-3">No images yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {images.map((img) => (
              <div key={img.publicId} className="relative group">
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-36 object-cover rounded-fc-md border border-fc-line"
                />
                <div className="mt-1 flex items-start justify-between gap-1">
                  <span className="text-[10px] text-fc-ink-3 break-all leading-tight">
                    {img.alt}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(`Delete image "${img.alt}"?`)) handleDelete(img.publicId);
                    }}
                    className="shrink-0 text-[10px] text-red-500 hover:text-red-700 underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upload form */}
      <section>
        <h2 className="text-sm font-semibold text-fc-ink mb-3">Upload new image</h2>
        <form
          onSubmit={handleUpload}
          className="space-y-4 border border-fc-line rounded-fc-lg p-5 bg-fc-paper-2"
        >
          <div>
            <label className="block text-xs text-fc-ink-2 mb-1" htmlFor="img-file">
              Image file <span className="text-fc-ink-3">(JPEG, PNG, WebP, AVIF · max 10 MB)</span>
            </label>
            <input
              id="img-file"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              required
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block text-sm text-fc-ink-2 file:mr-3 file:py-1.5 file:px-3 file:rounded-fc-md file:border-0 file:text-xs file:font-medium file:bg-fc-white file:text-fc-ink file:cursor-pointer hover:file:bg-fc-paper-2"
            />
          </div>
          <div>
            <label className="block text-xs text-fc-ink-2 mb-1" htmlFor="img-alt">
              Alt text <span className="text-fc-ink-3">(optional — defaults to lot code)</span>
            </label>
            <input
              id="img-alt"
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder={`${lotCode ?? 'lot'} lot photo`}
              className="w-full border border-fc-border-strong rounded-fc-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fc-sage-deep bg-fc-white"
            />
          </div>

          {uploadError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-fc-md px-3 py-2">
              {uploadError}
            </p>
          )}
          {uploadSuccess && (
            <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-fc-md px-3 py-2 break-all">
              {uploadSuccess}
            </p>
          )}

          <button
            type="submit"
            disabled={!file || uploading}
            className="bg-fc-sage-deep text-fc-white text-sm font-medium px-5 py-2 rounded-fc-md hover:bg-fc-sage-deep/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading…' : 'Upload image'}
          </button>
        </form>
      </section>

      {/* Link to lot passport */}
      <p className="mt-8 text-xs text-fc-ink-3">
        View on site:{' '}
        <a
          href={`/lots/${lotCode}`}
          className="underline underline-offset-2 hover:text-fc-ink"
          target="_blank"
          rel="noreferrer"
        >
          /lots/{lotCode}
        </a>
      </p>
    </div>
  );
}
