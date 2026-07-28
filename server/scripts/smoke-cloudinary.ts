/**
 * Cloudinary upload smoke test
 *
 * Uploads a tiny 1×1 px PNG to Cloudinary, verifies the returned secure URL
 * is reachable, then immediately deletes the test asset. Exits with a clear
 * success or failure message.
 *
 * Run from the repo root:
 *   npm run smoke:cloudinary --workspace server
 *
 * Or from the server/ directory:
 *   npm run smoke:cloudinary
 */

import https from 'node:https';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(import.meta.dirname, '../../.env') });

// ---------------------------------------------------------------------------
// Env checks
// ---------------------------------------------------------------------------

function check(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`✗  ${name} is not set — add it to Replit Secrets`);
    process.exit(1);
  }
  return value;
}

// Accept CLOUDINARY_URL or the three individual vars.
const cloudinaryUrl = process.env['CLOUDINARY_URL'];
let cloudName: string;

if (cloudinaryUrl) {
  // Sanitize: strip "CLOUDINARY_URL=" prefix that users sometimes paste
  const idx = cloudinaryUrl.indexOf('cloudinary://');
  if (idx === -1) {
    console.error(
      '✗  CLOUDINARY_URL does not contain a cloudinary:// URL.\n' +
        '   The value must be exactly: cloudinary://api_key:api_secret@cloud_name\n' +
        '   (no "CLOUDINARY_URL=" prefix — just the URL itself)',
    );
    process.exit(1);
  }
  const sanitized = cloudinaryUrl.slice(idx).trim();
  process.env['CLOUDINARY_URL'] = sanitized;

  // Parse cloud name for display
  const match = sanitized.match(/^cloudinary:\/\/[^:]+:[^@]+@(.+)$/);
  cloudName = match?.[1] ?? '(parsed from CLOUDINARY_URL)';
} else {
  // Fall back to individual vars
  cloudName = check('CLOUDINARY_CLOUD_NAME');
  check('CLOUDINARY_API_KEY');
  check('CLOUDINARY_API_SECRET');
}

// Dynamic import AFTER sanitization so SDK reads the correct env var.
const { v2: cloudinary } = await import('cloudinary');

if (!cloudinaryUrl || !process.env['CLOUDINARY_URL']?.startsWith('cloudinary://')) {
  cloudinary.config({
    cloud_name: process.env['CLOUDINARY_CLOUD_NAME'],
    api_key: process.env['CLOUDINARY_API_KEY'],
    api_secret: process.env['CLOUDINARY_API_SECRET'],
    secure: true,
  });
} else {
  cloudinary.config({ secure: true });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function uploadBuffer(
  buffer: Buffer,
  folder: string,
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err || !result) reject(new Error(err?.message ?? 'Upload failed'));
      else resolve(result);
    });
    stream.end(buffer);
  });
}

function checkUrl(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    https
      .request(url, { method: 'HEAD' }, (res) => resolve(res.statusCode ?? 0))
      .on('error', reject)
      .end();
  });
}

// ---------------------------------------------------------------------------
// Minimal 1×1 transparent PNG (67 bytes)
// ---------------------------------------------------------------------------
const TINY_PNG = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489' +
    '0000000a49444154789c6260000000020001e221bc330000000049454e44ae426082',
  'hex',
);

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log('Cloudinary smoke test');
console.log(`  Cloud: ${cloudName}`);
console.log('');

// 1. Upload
console.log('1/3  Uploading 1×1 test image…');
let uploadResult: { secure_url: string; public_id: string };
try {
  uploadResult = await uploadBuffer(TINY_PNG, 'fincava/smoke-test');
} catch (err) {
  console.error('\n✗  Upload failed:');
  console.error((err as Error).message);
  console.error('\nCommon causes:');
  console.error('  • CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET is wrong');
  console.error('  • CLOUDINARY_CLOUD_NAME does not match the account');
  console.error('  • The Cloudinary account is suspended or over quota');
  process.exit(1);
}
console.log(`     public_id:  ${uploadResult.public_id}`);
console.log(`     secure_url: ${uploadResult.secure_url}`);

// 2. Verify URL is reachable
console.log('2/3  Checking URL is publicly accessible…');
let statusCode: number;
try {
  statusCode = await checkUrl(uploadResult.secure_url);
} catch (err) {
  console.error('\n✗  URL check failed:', (err as Error).message);
  process.exit(1);
}
if (statusCode < 200 || statusCode >= 400) {
  console.error(`\n✗  URL returned HTTP ${statusCode} — image may not be publicly accessible`);
  process.exit(1);
}
console.log(`     HTTP ${statusCode} OK`);

// 3. Clean up
console.log('3/3  Deleting test asset…');
const deleteResult = await cloudinary.uploader.destroy(uploadResult.public_id);
if (deleteResult.result !== 'ok') {
  console.warn(
    `     Warning: delete returned "${deleteResult.result}" — clean up manually if needed`,
  );
} else {
  console.log('     Deleted');
}

console.log('\n✓  Cloudinary is configured correctly and image uploads are working end-to-end.');
console.log('\nNext step: upload a real lot image via the admin UI at /admin/lots/<lotCode>');
console.log('and verify it appears on the lot detail page at /lots/<lotCode>.');
