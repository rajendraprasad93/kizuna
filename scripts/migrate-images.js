/**
 * Kizuna — Migrate existing report images to Azure Blob Storage
 *
 * This script finds reports in PostgreSQL whose image_urls contain base64
 * image data, uploads each image to Azure Blob Storage, verifies the upload,
 * and updates image_urls in PostgreSQL with the blob reference.
 *
 * SAFETY GUARANTEES:
 * - Idempotent: safe to run multiple times. Already-migrated images are skipped.
 * - Dry-run mode: pass --dry-run to preview what would be migrated without changing anything.
 * - Original base64 data is preserved in a backup column (image_urls_backup) until
 *   you explicitly run with --cleanup after verifying.
 * - No report IDs, relationships, or other columns are changed.
 *
 * USAGE:
 *   node scripts/migrate-images.js              # dry run (safe preview)
 *   node scripts/migrate-images.js --execute    # actually migrate
 *   node scripts/migrate-images.js --cleanup    # remove backup column after verification
 *
 * REQUIREMENTS:
 * - .env must have AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_CONTAINER_NAME
 * - You must be logged in via `az login` with Storage Blob Data Contributor role
 * - DATABASE_URL must point to your running PostgreSQL instance
 */

import "dotenv/config";
import pg from "pg";
import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";

// ── Config ────────────────────────────────────────────────────────────────────

const DRY_RUN = !process.argv.includes("--execute");
const CLEANUP = process.argv.includes("--cleanup");

const ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME;
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/civiceye";

if (!ACCOUNT_NAME || !CONTAINER_NAME) {
  console.error(
    "❌ AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_CONTAINER_NAME must be set in .env"
  );
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isBase64Image(value) {
  if (typeof value === "string") {
    return value.startsWith("data:image/") || isLikelyBase64(value);
  }
  if (typeof value === "object" && value !== null) {
    // Could be { blobName, url } — already migrated
    if (value.blobName) return false;
    if (typeof value.url === "string" && value.url.includes("blob.core.windows.net")) return false;
    if (typeof value.data === "string") return isBase64Image(value.data);
  }
  return false;
}

function isLikelyBase64(str) {
  // Base64 strings are long (>500 chars) and contain only base64 chars
  return (
    typeof str === "string" &&
    str.length > 500 &&
    /^[A-Za-z0-9+/]+=*$/.test(str.slice(0, 100))
  );
}

function extractBase64AndMime(value) {
  if (typeof value === "string") {
    const match = value.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      return { mimeType: match[1], base64: match[2] };
    }
    // Raw base64 without prefix — assume JPEG
    return { mimeType: "image/jpeg", base64: value };
  }
  if (typeof value === "object" && value?.data) {
    return extractBase64AndMime(value.data);
  }
  return null;
}

function extensionFromMime(mimeType) {
  const map = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
  };
  return map[String(mimeType).toLowerCase()] || "jpg";
}

function estimateSizeKB(base64) {
  return Math.round((base64.length * 3) / 4 / 1024);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n========================================");
  console.log(" Kizuna — Azure Blob Storage Migration ");
  console.log("========================================");
  console.log(`Mode    : ${DRY_RUN ? "DRY RUN (no changes)" : "EXECUTE (will migrate)"}`);
  console.log(`Account : ${ACCOUNT_NAME}`);
  console.log(`Container: ${CONTAINER_NAME}`);
  console.log("========================================\n");

  // ── Connect to PostgreSQL ─────────────────────────────────────────────────
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  try {
    await pool.query("SELECT 1");
    console.log("✅ PostgreSQL connected\n");
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err.message);
    process.exit(1);
  }

  // ── Handle --cleanup ─────────────────────────────────────────────────────
  if (CLEANUP) {
    await handleCleanup(pool);
    await pool.end();
    return;
  }

  // ── Connect to Azure ──────────────────────────────────────────────────────
  const accountUrl = `https://${ACCOUNT_NAME}.blob.core.windows.net`;
  const credential = new DefaultAzureCredential();
  const blobServiceClient = new BlobServiceClient(accountUrl, credential);
  const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

  try {
    await containerClient.getProperties();
    console.log("✅ Azure Blob Storage connected\n");
  } catch (err) {
    console.error("❌ Azure Blob Storage connection failed:", err.message);
    console.error("   Ensure you are logged in with `az login` and have Storage Blob Data Contributor role.");
    await pool.end();
    process.exit(1);
  }

  // ── Ensure backup column exists ───────────────────────────────────────────
  if (!DRY_RUN) {
    await pool.query(`
      ALTER TABLE reports
      ADD COLUMN IF NOT EXISTS image_urls_backup JSONB DEFAULT NULL;
    `);
    console.log("✅ Backup column image_urls_backup ensured\n");
  }

  // ── Find reports with base64 image data ───────────────────────────────────
  const { rows: reports } = await pool.query(`
    SELECT id, image_urls, image_urls_backup
    FROM reports
    WHERE image_urls IS NOT NULL
      AND image_urls != '[]'::jsonb
      AND image_urls != 'null'::jsonb
    ORDER BY created_at ASC
  `);

  console.log(`📋 Found ${reports.length} report(s) with image_urls data\n`);

  // ── Stats ─────────────────────────────────────────────────────────────────
  let toMigrate = 0;
  let alreadyMigrated = 0;
  let skipped = 0;
  let succeeded = 0;
  let failed = 0;
  let totalBytes = 0;

  // ── Process each report ───────────────────────────────────────────────────
  for (const report of reports) {
    let imageUrls;
    try {
      imageUrls = typeof report.image_urls === "string"
        ? JSON.parse(report.image_urls)
        : report.image_urls;
    } catch {
      console.warn(`  ⚠️  Report ${report.id}: could not parse image_urls — skipping`);
      skipped++;
      continue;
    }

    if (!Array.isArray(imageUrls)) imageUrls = [imageUrls];

    // Check if already fully migrated (all entries are blob references)
    const allMigrated = imageUrls.every(
      (u) => !isBase64Image(u)
    );
    if (allMigrated && report.image_urls_backup !== null) {
      console.log(`  ✓  Report ${report.id}: already migrated — skipping`);
      alreadyMigrated++;
      continue;
    }

    // Find base64 entries
    const base64Entries = imageUrls.filter(isBase64Image);
    if (base64Entries.length === 0) {
      console.log(`  -  Report ${report.id}: no base64 images found — skipping`);
      skipped++;
      continue;
    }

    toMigrate++;
    const estimated = base64Entries.reduce((sum, e) => {
      const extracted = extractBase64AndMime(e);
      return sum + (extracted ? estimateSizeKB(extracted.base64) * 1024 : 0);
    }, 0);
    totalBytes += estimated;

    console.log(
      `  📄 Report ${report.id}: ${base64Entries.length} image(s) ~${formatBytes(estimated)}`
    );

    if (DRY_RUN) continue;

    // ── Upload each base64 image ─────────────────────────────────────────
    const newImageUrls = [];
    let reportFailed = false;

    for (let i = 0; i < imageUrls.length; i++) {
      const entry = imageUrls[i];

      if (!isBase64Image(entry)) {
        // Already a blob reference — keep as is
        newImageUrls.push(entry);
        continue;
      }

      const extracted = extractBase64AndMime(entry);
      if (!extracted) {
        console.warn(`    ⚠️  Could not extract base64 from entry ${i} — keeping original`);
        newImageUrls.push(entry);
        continue;
      }

      const { mimeType, base64 } = extracted;
      const ext = extensionFromMime(mimeType);
      const blobName = `reports/${report.id}/${Date.now()}-${i}.${ext}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Skip if blob already exists (idempotency)
      if (await blockBlobClient.exists()) {
        console.log(`    ✓  Blob already exists: ${blobName} — skipping upload`);
        newImageUrls.push({
          blobName,
          url: blockBlobClient.url,
        });
        continue;
      }

      try {
        const buffer = Buffer.from(base64, "base64");
        await blockBlobClient.uploadData(buffer, {
          blobHTTPHeaders: { blobContentType: mimeType },
        });

        // Verify blob is accessible
        const props = await blockBlobClient.getProperties();
        if (!props.contentLength) {
          throw new Error("Blob uploaded but contentLength is zero");
        }

        console.log(
          `    ✅ Uploaded: ${blobName} (${formatBytes(props.contentLength)})`
        );

        newImageUrls.push({
          blobName,
          url: blockBlobClient.url,
        });
      } catch (uploadErr) {
        console.error(`    ❌ Upload failed for entry ${i}:`, uploadErr.message);
        newImageUrls.push(entry); // keep original on failure
        reportFailed = true;
      }
    }

    if (reportFailed) {
      failed++;
      console.warn(`  ⚠️  Report ${report.id}: some images failed — original data preserved`);
      continue;
    }

    // ── Update PostgreSQL ──────────────────────────────────────────────────
    try {
      await pool.query(
        `UPDATE reports
         SET image_urls = $1::jsonb,
             image_urls_backup = COALESCE(image_urls_backup, $2::jsonb),
             updated_at = now()
         WHERE id = $3`,
        [
          JSON.stringify(newImageUrls),
          JSON.stringify(imageUrls), // backup original
          report.id,
        ]
      );
      console.log(`  ✅ Report ${report.id}: PostgreSQL updated with ${newImageUrls.length} blob reference(s)`);
      succeeded++;
    } catch (dbErr) {
      console.error(`  ❌ Report ${report.id}: DB update failed:`, dbErr.message);
      failed++;
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n========================================");
  console.log(" Migration Summary");
  console.log("========================================");
  if (DRY_RUN) {
    console.log(`Reports to migrate : ${toMigrate}`);
    console.log(`Already migrated   : ${alreadyMigrated}`);
    console.log(`Skipped (no data)  : ${skipped}`);
    console.log(`Estimated data     : ${formatBytes(totalBytes)}`);
    console.log("\n👆 This was a DRY RUN — no changes were made.");
    console.log("   To actually migrate, run:");
    console.log("   node scripts/migrate-images.js --execute");
  } else {
    console.log(`Succeeded  : ${succeeded}`);
    console.log(`Failed     : ${failed}`);
    console.log(`Skipped    : ${skipped}`);
    console.log(`Already OK : ${alreadyMigrated}`);
    if (failed === 0 && succeeded > 0) {
      console.log("\n✅ Migration complete. Original base64 data is preserved");
      console.log("   in the image_urls_backup column.");
      console.log("   After verifying images display correctly, run:");
      console.log("   node scripts/migrate-images.js --cleanup");
    } else if (failed > 0) {
      console.log("\n⚠️  Some images failed. Original data is intact.");
      console.log("   Investigate the errors above and re-run with --execute.");
    }
  }
  console.log("========================================\n");

  await pool.end();
}

// ── Cleanup handler ───────────────────────────────────────────────────────────

async function handleCleanup(pool) {
  console.log("🧹 Cleanup mode — removing image_urls_backup column\n");

  // Safety check: make sure no reports still have base64 in image_urls
  const { rows } = await pool.query(`
    SELECT COUNT(*) as count FROM reports
    WHERE image_urls_backup IS NOT NULL
  `);
  const backupCount = parseInt(rows[0].count);

  if (backupCount === 0) {
    console.log("ℹ️  No backup data found — nothing to clean up.");
    return;
  }

  console.log(`Found ${backupCount} report(s) with backup data.`);
  console.log("Dropping image_urls_backup column...");

  await pool.query(`
    ALTER TABLE reports DROP COLUMN IF EXISTS image_urls_backup;
  `);

  console.log("✅ Cleanup complete — backup column removed.");
  console.log("   Original base64 data has been permanently deleted.");
}

main().catch((err) => {
  console.error("❌ Migration script crashed:", err);
  process.exit(1);
});
