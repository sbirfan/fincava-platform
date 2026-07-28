// IMPORTANT: cloudinary is loaded via dynamic import (not a static `import`
// at the top of this file) so we can sanitize process.env['CLOUDINARY_URL']
// before the SDK auto-reads it at module-initialization time.
//
// The Cloudinary SDK throws if CLOUDINARY_URL is set but doesn't start with
// 'cloudinary://'. Users commonly paste the full "CLOUDINARY_URL=cloudinary://…"
// line from a .env file. We strip that prefix here before the SDK ever sees it.

import type { v2 as CloudinaryV2 } from 'cloudinary';
import { env, requireEnv } from '../env.js';

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

// ── Lazy singleton ──────────────────────────────────────────────────────────

let _cloudinary: typeof CloudinaryV2 | null = null;

async function getCloudinary(): Promise<typeof CloudinaryV2> {
  if (_cloudinary) return _cloudinary;

  // Sanitize CLOUDINARY_URL so the SDK doesn't throw on a malformed value.
  // Accept both 'cloudinary://...' and 'CLOUDINARY_URL=cloudinary://...'.
  const raw = process.env['CLOUDINARY_URL'];
  if (raw) {
    const idx = raw.indexOf('cloudinary://');
    if (idx > 0) {
      // Strip key= prefix that users paste from .env files
      process.env['CLOUDINARY_URL'] = raw.slice(idx).trim();
    } else if (idx === -1) {
      // Not a cloudinary:// URL at all — remove it so the SDK won't throw,
      // then fall through to individual-var config below.
      delete process.env['CLOUDINARY_URL'];
    }
    // idx === 0 → already correct, leave as-is
  }

  // Dynamic import happens AFTER the sanitization above.
  const { v2 } = await import('cloudinary');

  const cloudinaryUrl = process.env['CLOUDINARY_URL'];
  if (cloudinaryUrl?.startsWith('cloudinary://')) {
    // SDK has already auto-configured from CLOUDINARY_URL during import —
    // we only need to enforce secure: true.
    v2.config({ secure: true });
  } else if (env.CLOUDINARY_CLOUD_NAME) {
    // Fall back to three individual secrets.
    v2.config({
      cloud_name: requireEnv('CLOUDINARY_CLOUD_NAME'),
      api_key: requireEnv('CLOUDINARY_API_KEY'),
      api_secret: requireEnv('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  } else {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_URL (recommended) or ' +
        'CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET in Replit Secrets.',
    );
  }

  _cloudinary = v2;
  return v2;
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Upload a file buffer to Cloudinary under the `fincava/lots/<lotCode>`
 * folder. Returns the secure URL and public_id.
 */
export async function uploadImage(
  buffer: Buffer,
  lotCode: string,
): Promise<CloudinaryUploadResult> {
  const cloudinary = await getCloudinary();

  return new Promise((resolve, reject) => {
    const folder = `fincava/lots/${lotCode}`;
    const uploadStream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error || !result) {
        reject(new Error(error?.message ?? 'Cloudinary upload failed'));
        return;
      }
      resolve({ url: result.secure_url, publicId: result.public_id });
    });
    uploadStream.end(buffer);
  });
}

/**
 * Delete an image from Cloudinary by its public_id. Swallows "not found"
 * errors (already deleted or never uploaded) but re-throws real failures.
 */
export async function deleteImage(publicId: string): Promise<void> {
  const cloudinary = await getCloudinary();
  const result = await cloudinary.uploader.destroy(publicId);
  if (result.result !== 'ok' && result.result !== 'not found') {
    throw new Error(`Cloudinary delete failed: ${result.result}`);
  }
}
