/**
 * Secure Image Proxy Route
 *
 * GET /api/images/<blobName>
 *
 * Fetches an image from Azure Blob Storage and streams it to the browser.
 * Uses req.path directly — the most reliable way to get the full path
 * regardless of Express/router version param handling differences.
 */

import express from "express";
import { downloadImageStream, isConfigured } from "../services/azureStorageService.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Soft auth — does not block unauthenticated requests.
// <img> tags never send Authorization headers, so hard auth would break all images.
function softAuth(req, _res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token) {
    try { req.user = jwt.verify(token, process.env.JWT_SECRET); } catch { /* ok */ }
  }
  next();
}

router.use(softAuth);

// Use router.use() instead of router.get() to bypass path-to-regexp parsing issues
router.use(async (req, res) => {
  // Only handle GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!isConfigured()) {
    return res.status(503).json({ error: "Azure Blob Storage is not configured." });
  }

  // req.path gives us the path relative to where this router is mounted,
  // e.g. /reports/abc123/1234567890.jpg — strip the leading slash to get the blob name
  const blobName = req.path.replace(/^\/+/, "");

  if (!blobName) {
    return res.status(400).json({ error: "blobName is required." });
  }

  if (blobName.includes("..")) {
    return res.status(400).json({ error: "Invalid blob name." });
  }

  try {
    const { stream, contentType, contentLength } = await downloadImageStream(blobName);

    res.setHeader("Content-Type", contentType || "image/jpeg");
    res.setHeader("Cache-Control", "private, max-age=86400");
    if (contentLength) res.setHeader("Content-Length", contentLength);

    stream.pipe(res);
    stream.on("error", (err) => {
      console.error("Image stream error:", err.message);
      if (!res.headersSent) res.status(500).end();
    });
  } catch (err) {
    console.error(`Image proxy error for "${blobName}":`, err.message);
    if (err.statusCode === 404 || err.message?.includes("BlobNotFound")) {
      return res.status(404).json({ error: "Image not found." });
    }
    if (err.statusCode === 403 || err.message?.includes("AuthorizationFailed")) {
      return res.status(403).json({ error: "Not authorised." });
    }
    return res.status(500).json({ error: "Failed to retrieve image." });
  }
});

export default router;
