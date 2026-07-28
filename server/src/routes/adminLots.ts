import { eq } from 'drizzle-orm';
import { Router } from 'express';
import multer from 'multer';
import { getDb } from '../db/index.js';
import { greenCoffeeLots } from '../db/schema.js';
import { deleteImage, uploadImage } from '../lib/cloudinary.js';
import { HttpError } from '../middleware/errorHandler.js';

export const adminLotsRouter = Router();

// Keep images in memory (not disk) — Cloudinary is the permanent store.
// 10 MB limit per file.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Use JPEG, PNG, WebP, or AVIF.`));
    }
  },
});

interface LotImage {
  url: string;
  publicId: string;
  alt: string;
}

// ---------------------------------------------------------------------------
// POST /api/admin/lots/:lotCode/images
// Upload one image and append it to the lot's image array.
// ---------------------------------------------------------------------------
adminLotsRouter.post('/:lotCode/images', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new HttpError(400, 'No image file provided — include a "image" field in the form data');
    }

    const lotCode = req.params['lotCode'] as string;
    const alt = (req.body.alt as string | undefined)?.trim() || `${lotCode} lot photo`;

    const db = getDb();
    const [lot] = await db
      .select({ id: greenCoffeeLots.id, images: greenCoffeeLots.images })
      .from(greenCoffeeLots)
      .where(eq(greenCoffeeLots.lotCode, lotCode))
      .limit(1);

    if (!lot) {
      throw new HttpError(404, `Lot not found: ${lotCode}`);
    }

    // Upload to Cloudinary
    const { url, publicId } = await uploadImage(req.file.buffer, lotCode);

    const existing = (lot.images ?? []) as LotImage[];
    const updated: LotImage[] = [...existing, { url, publicId, alt }];

    await db
      .update(greenCoffeeLots)
      .set({ images: updated, updatedAt: new Date() })
      .where(eq(greenCoffeeLots.id, lot.id));

    res.status(201).json({ url, publicId, alt });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/admin/lots/:lotCode/images/:publicId
// Remove one image from Cloudinary and from the lot's image array.
// publicId is base64url-encoded by the client to avoid path-separator issues.
// ---------------------------------------------------------------------------
adminLotsRouter.delete('/:lotCode/images/:encodedPublicId', async (req, res, next) => {
  try {
    const lotCode = req.params['lotCode'] as string;
    const encodedPublicId = req.params['encodedPublicId'] as string;
    const publicId = Buffer.from(encodedPublicId, 'base64url').toString('utf8');

    const db = getDb();
    const [lot] = await db
      .select({ id: greenCoffeeLots.id, images: greenCoffeeLots.images })
      .from(greenCoffeeLots)
      .where(eq(greenCoffeeLots.lotCode, lotCode))
      .limit(1);

    if (!lot) {
      throw new HttpError(404, `Lot not found: ${lotCode}`);
    }

    const existing = (lot.images ?? []) as LotImage[];
    const updated = existing.filter((img) => img.publicId !== publicId);

    if (updated.length === existing.length) {
      throw new HttpError(404, `Image not found on lot: ${publicId}`);
    }

    // Delete from Cloudinary first; DB update only if that succeeds.
    await deleteImage(publicId);

    await db
      .update(greenCoffeeLots)
      .set({ images: updated, updatedAt: new Date() })
      .where(eq(greenCoffeeLots.id, lot.id));

    res.json({ deleted: publicId });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/admin/lots/:lotCode/images
// List current images for a lot (convenience for the admin UI).
// ---------------------------------------------------------------------------
adminLotsRouter.get('/:lotCode/images', async (req, res, next) => {
  try {
    const lotCode = req.params['lotCode'] as string;
    const db = getDb();
    const [lot] = await db
      .select({ images: greenCoffeeLots.images })
      .from(greenCoffeeLots)
      .where(eq(greenCoffeeLots.lotCode, lotCode))
      .limit(1);

    if (!lot) {
      throw new HttpError(404, `Lot not found: ${lotCode}`);
    }

    res.json((lot.images ?? []) as LotImage[]);
  } catch (err) {
    next(err);
  }
});
