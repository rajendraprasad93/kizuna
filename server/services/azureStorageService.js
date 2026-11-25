/**
 * Azure Blob Storage Service for Kizuna
 *
 * Authentication: DefaultAzureCredential — reads your active `az login` session.
 * No account keys or connection strings are used anywhere in this file.
 *
 * Required environment variables (non-secret):
 *   AZURE_STORAGE_ACCOUNT_NAME  — e.g. kizunamachihosen
 *   AZURE_STORAGE_CONTAINER_NAME — e.g. images
 */

import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";

// ── Configuration ────────────────────────────────────────────────────────────

const ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME;

if (!ACCOUNT_NAME) {
  console.warn(
    "⚠️  AZURE_STORAGE_ACCOUNT_NAME is not set — Azure Blob Storage will be unavailable."
  );
}
if (!CONTAINER_NAME) {
  console.warn(
    "⚠️  AZURE_STORAGE_CONTAINER_NAME is not set — Azure Blob Storage will be unavailable."
  );
}

// ── Client (lazy singleton) ───────────────────────────────────────────────────

let _containerClient = null;

function getContainerClient() {
  if (_containerClient) return _containerClient;

  if (!ACCOUNT_NAME || !CONTAINER_NAME) {
    throw new Error(
      "Azure Blob Storage is not configured. Set AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_CONTAINER_NAME in your .env file."
    );
  }

  const accountUrl = `https://${ACCOUNT_NAME}.blob.core.windows.net`;
  const credential = new DefaultAzureCredential();
  const blobServiceClient = new BlobServiceClient(accountUrl, credential);
  _containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

  console.log(
    `✅ Azure Blob Storage client initialised — account: ${ACCOUNT_NAME}, container: ${CONTAINER_NAME}`
  );

  return _containerClient;
}

// ── Helpers ──────────────────────────────────────────���────────────────────────

/**
 * Derive a file extension from a MIME type.
 * Falls back to .bin for unknown types.
 */
function extensionFromMime(mimeType) {
  const map = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/bmp": "bmp",
    "image/tiff": "tiff",
  };
  return map[String(mimeType).toLowerCase()] || "bin";
}

/**
 * Build the blob name for a report image.
 * Format: reports/<reportId>/<timestamp>-<random>.<ext>
 */
function buildBlobName(reportId, mimeType) {
  const ext = extensionFromMime(mimeType);
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `reports/${reportId}/${timestamp}-${random}.${ext}`;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Upload a base64-encoded image to Azure Blob Storage.
 *
 * @param {string} base64Data   — raw base64 string (no data: URI prefix)
 * @param {string} reportId     — used to organise blobs under reports/<reportId>/
 * @param {string} mimeType     — e.g. "image/jpeg"
 * @returns {{ blobName: string, url: string, sizeBytes: number }}
 */
export async function uploadImage(base64Data, reportId, mimeType = "image/jpeg") {
  const containerClient = getContainerClient();

  // Strip data URI prefix if present (e.g. "data:image/jpeg;base64,...")
  const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, "");
  const buffer = Buffer.from(cleanBase64, "base64");

  const blobName = buildBlobName(reportId, mimeType);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: mimeType },
  });

  const url = blockBlobClient.url;

  console.log(
    `📤 Uploaded blob: ${blobName} (${buffer.byteLength} bytes) → ${url}`
  );

  return {
    blobName,
    url,
    sizeBytes: buffer.byteLength,
  };
}

/**
 * Upload a Buffer directly to Azure Blob Storage.
 * Used by the migration script when image data is already a Buffer.
 *
 * @param {Buffer} buffer
 * @param {string} blobName   — full blob path, e.g. reports/<id>/file.jpg
 * @param {string} mimeType
 * @returns {{ blobName: string, url: string, sizeBytes: number }}
 */
export async function uploadBuffer(buffer, blobName, mimeType = "image/jpeg") {
  const containerClient = getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: mimeType },
  });

  console.log(`📤 Uploaded blob: ${blobName} (${buffer.byteLength} bytes)`);

  return {
    blobName,
    url: blockBlobClient.url,
    sizeBytes: buffer.byteLength,
  };
}

/**
 * Download a blob and return a readable stream plus content-type.
 * Used by the secure image proxy endpoint.
 *
 * @param {string} blobName
 * @returns {{ stream: ReadableStream, contentType: string, contentLength: number|null }}
 */
export async function downloadImageStream(blobName) {
  const containerClient = getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  const downloadResponse = await blockBlobClient.download(0);

  return {
    stream: downloadResponse.readableStreamBody,
    contentType:
      downloadResponse.contentType || "application/octet-stream",
    contentLength: downloadResponse.contentLength || null,
  };
}

/**
 * Check whether a blob exists in the container.
 * Used by the migration script to avoid duplicate uploads.
 *
 * @param {string} blobName
 * @returns {boolean}
 */
export async function blobExists(blobName) {
  const containerClient = getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  return blockBlobClient.exists();
}

/**
 * List all blobs under an optional prefix.
 *
 * @param {string} [prefix]  — e.g. "reports/<reportId>/"
 * @returns {Array<{ name: string, url: string, sizeBytes: number, lastModified: Date }>}
 */
export async function listBlobs(prefix = "") {
  const containerClient = getContainerClient();
  const results = [];

  for await (const blob of containerClient.listBlobsFlat({ prefix })) {
    results.push({
      name: blob.name,
      url: `https://${ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}/${blob.name}`,
      sizeBytes: blob.properties.contentLength,
      lastModified: blob.properties.lastModified,
    });
  }

  return results;
}

/**
 * Delete a blob by name.
 * Only called explicitly — never called automatically by the integration.
 *
 * @param {string} blobName
 * @returns {boolean} true if deleted, false if it did not exist
 */
export async function deleteBlob(blobName) {
  const containerClient = getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const response = await blockBlobClient.deleteIfExists();
  if (response.succeeded) {
    console.log(`🗑️  Deleted blob: ${blobName}`);
  }
  return response.succeeded;
}

/**
 * Verify that the Azure Blob Storage connection is working.
 * Called during server startup and test runs.
 *
 * @returns {{ ok: boolean, account: string, container: string, error?: string }}
 */
export async function verifyConnection() {
  try {
    const containerClient = getContainerClient();
    // A single lightweight call — just checks container exists and is accessible
    const props = await containerClient.getProperties();
    return {
      ok: true,
      account: ACCOUNT_NAME,
      container: CONTAINER_NAME,
    };
  } catch (err) {
    console.error("❌ Azure Blob Storage connection failed:", err.message);
    return {
      ok: false,
      account: ACCOUNT_NAME,
      container: CONTAINER_NAME,
      error: err.message,
    };
  }
}

export const isConfigured = () => !!(ACCOUNT_NAME && CONTAINER_NAME);
