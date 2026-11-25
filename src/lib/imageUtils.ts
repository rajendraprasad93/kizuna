/**
 * Resolve an image_urls entry to a displayable src string.
 *
 * image_urls entries can be in three forms after Azure integration:
 *   1. Plain string — data URI ("data:image/...") or legacy URL
 *   2. { blobName, url } — Azure blob reference (new format)
 *   3. { blobName }     — blob reference without full URL
 *
 * Azure blobs are always routed through the secure backend proxy
 * GET /api/images/<blobName> so the storage account is never exposed.
 */
export function resolveImageSrc(entry: unknown): string | null {
  if (!entry) return null;

  if (typeof entry === 'string') {
    if (entry.startsWith('data:') || entry.startsWith('http')) return entry;
    if (entry.trim()) return `/api/images/${entry}`;
    return null;
  }

  if (typeof entry === 'object' && entry !== null) {
    const obj = entry as Record<string, unknown>;
    if (typeof obj.blobName === 'string' && obj.blobName.trim()) {
      return `/api/images/${obj.blobName}`;
    }
    if (typeof obj.url === 'string' && obj.url.trim()) return obj.url;
  }

  return null;
}
