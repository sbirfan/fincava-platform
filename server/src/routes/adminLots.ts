import { adminLotCreateInputSchema, adminLotUpdateInputSchema } from '@fincava/shared';
import { eq } from 'drizzle-orm';
import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import multer from 'multer';
import { getDb } from '../db/index.js';
import {
  greenCoffeeLots,
  rfqs,
  sampleRequests,
  sourcingRequests,
  verificationRequests,
} from '../db/schema.js';
import { deleteImage, uploadImage } from '../lib/cloudinary.js';
import { HttpError } from '../middleware/errorHandler.js';

export const adminLotsRouter = Router();

// Keep images in memory (not disk) — Cloudinary is the permanent store.
// §9: server-validated type (jpeg/png/webp only) and size (≤5MB), admin-only.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Use JPEG, PNG, or WebP.`));
    }
  },
});

// multer surfaces both fileFilter rejections and size-limit overruns by
// calling next(err) with a plain Error/MulterError, which would otherwise
// fall through to the generic 500 handler — translate both into a proper
// 400 with a message the admin UI can actually show.
function uploadSingleImage(req: Request, res: Response, next: NextFunction): void {
  upload.single('image')(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      next(new HttpError(400, 'Image exceeds the 5MB limit'));
      return;
    }
    next(new HttpError(400, err instanceof Error ? err.message : 'Image upload failed'));
  });
}

interface LotImage {
  url: string;
  publicId: string;
  alt: string;
}

function toDbValue(v: unknown): unknown {
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (typeof v === 'number') return String(v);
  return v;
}

// ---------------------------------------------------------------------------
// GET /api/admin/lots
// Full lot list with every admin-only field (inventoryType, visible,
// priceNotesInternal, etc.) — never exposed on the public /api/lots surface.
// ---------------------------------------------------------------------------
adminLotsRouter.get('/', async (_req, res, next) => {
  try {
    const db = getDb();
    const rows = await db.select().from(greenCoffeeLots).orderBy(greenCoffeeLots.createdAt);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/admin/lots/:lotCode
// ---------------------------------------------------------------------------
adminLotsRouter.get('/:lotCode', async (req, res, next) => {
  try {
    const db = getDb();
    const [lot] = await db
      .select()
      .from(greenCoffeeLots)
      .where(eq(greenCoffeeLots.lotCode, req.params['lotCode'] as string))
      .limit(1);
    if (!lot) throw new HttpError(404, 'Lot not found');
    res.json(lot);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/admin/lots
// ---------------------------------------------------------------------------
adminLotsRouter.post('/', async (req, res, next) => {
  try {
    const parsed = adminLotCreateInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
      return;
    }
    const input = parsed.data;

    const db = getDb();
    const [existing] = await db
      .select({ id: greenCoffeeLots.id })
      .from(greenCoffeeLots)
      .where(eq(greenCoffeeLots.lotCode, input.lotCode))
      .limit(1);
    if (existing) {
      throw new HttpError(409, `Lot code already exists: ${input.lotCode}`);
    }

    // §7: visible defaults to true, except INVITE_ONLY lots default to
    // false on creation (admin flips it on later once terms are settled).
    // Only applies when the admin didn't explicitly set visible themselves.
    const visible =
      input.visible !== undefined ? input.visible : input.pricingStrategy !== 'INVITE_ONLY';

    const [created] = await db
      .insert(greenCoffeeLots)
      .values({
        lotCode: input.lotCode,
        title: input.title,
        commodityType: input.commodityType,
        inventoryType: input.inventoryType,
        status: input.status,
        visible,
        variety: input.variety,
        process: input.process,
        region: input.region,
        farm: input.farm ?? null,
        producer: input.producer ?? null,
        altitude: input.altitude ?? null,
        harvestDate: input.harvestDate ? new Date(input.harvestDate) : null,
        harvestWindow: input.harvestWindow ?? null,
        availableKg: toDbValue(input.availableKg) as string | null,
        cupScore: toDbValue(input.cupScore) as string | null,
        moisture: toDbValue(input.moisture) as string | null,
        waterActivity: toDbValue(input.waterActivity) as string | null,
        screenSize: input.screenSize ?? null,
        tastingNotes: input.tastingNotes ?? null,
        certifications: input.certifications,
        exportReadiness: input.exportReadiness ?? null,
        sampleAvailable: input.sampleAvailable,
        pricingStrategy: input.pricingStrategy,
        currency: input.currency,
        pricePerKg: toDbValue(input.pricePerKg) as string | null,
        priceRangeLowPerKg: toDbValue(input.priceRangeLowPerKg) as string | null,
        priceRangeHighPerKg: toDbValue(input.priceRangeHighPerKg) as string | null,
        incoterm: input.incoterm ?? null,
        priceNotesPublic: input.priceNotesPublic ?? null,
        priceNotesInternal: input.priceNotesInternal ?? null,
      })
      .returning();

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/admin/lots/:lotCode
// ---------------------------------------------------------------------------
adminLotsRouter.patch('/:lotCode', async (req, res, next) => {
  try {
    const parsed = adminLotUpdateInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
      return;
    }
    const input = parsed.data;

    const db = getDb();
    const [lot] = await db
      .select({ id: greenCoffeeLots.id })
      .from(greenCoffeeLots)
      .where(eq(greenCoffeeLots.lotCode, req.params['lotCode'] as string))
      .limit(1);
    if (!lot) throw new HttpError(404, 'Lot not found');

    const patch: Record<string, unknown> = { updatedAt: new Date() };
    for (const [key, value] of Object.entries(input)) {
      if (value === undefined) continue;
      if (key === 'harvestDate') {
        patch[key] = value ? new Date(value as string) : null;
        continue;
      }
      patch[key] = toDbValue(value);
    }

    const [updated] = await db
      .update(greenCoffeeLots)
      .set(patch)
      .where(eq(greenCoffeeLots.id, lot.id))
      .returning();

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/admin/lots/:lotCode
// Deletion guard: a lot referenced by any RFQ, sample request, sourcing
// matchedLotId, or verification linkedLotId cannot be deleted — the lot
// lifecycle ends at SOLD, not delete. Unreferenced lots can be truly deleted.
// ---------------------------------------------------------------------------
adminLotsRouter.delete('/:lotCode', async (req, res, next) => {
  try {
    const db = getDb();
    const [lot] = await db
      .select({ id: greenCoffeeLots.id })
      .from(greenCoffeeLots)
      .where(eq(greenCoffeeLots.lotCode, req.params['lotCode'] as string))
      .limit(1);
    if (!lot) throw new HttpError(404, 'Lot not found');

    const [rfqCount, sampleCount, sourcingCount, verificationCount] = await Promise.all([
      db.select({ id: rfqs.id }).from(rfqs).where(eq(rfqs.lotId, lot.id)),
      db
        .select({ id: sampleRequests.id })
        .from(sampleRequests)
        .where(eq(sampleRequests.lotId, lot.id)),
      db
        .select({ id: sourcingRequests.id })
        .from(sourcingRequests)
        .where(eq(sourcingRequests.matchedLotId, lot.id)),
      db
        .select({ id: verificationRequests.id })
        .from(verificationRequests)
        .where(eq(verificationRequests.linkedLotId, lot.id)),
    ]);

    const linkedCount =
      rfqCount.length + sampleCount.length + sourcingCount.length + verificationCount.length;

    if (linkedCount > 0) {
      throw new HttpError(
        409,
        `This lot has ${linkedCount} linked request${linkedCount === 1 ? '' : 's'} — set status to SOLD instead`,
      );
    }

    await db.delete(greenCoffeeLots).where(eq(greenCoffeeLots.id, lot.id));
    res.json({ deleted: req.params['lotCode'] });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/admin/lots/:lotCode/images
// Upload one image and append it to the lot's image array.
// ---------------------------------------------------------------------------
adminLotsRouter.post('/:lotCode/images', uploadSingleImage, async (req, res, next) => {
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
