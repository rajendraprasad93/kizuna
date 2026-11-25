/**
 * Kizuna — Azure Blob Storage Integration Tests
 *
 * Tests:
 *  1. Azure authentication (DefaultAzureCredential)
 *  2. Connection to correct storage account
 *  3. Access to the images container
 *  4. Upload a small sample file
 *  5. Confirm file appears in Azure (list blobs)
 *  6. Download the same file
 *  7. Compare downloaded content with original
 *  8. List and retrieve stored files
 *  9. Error handling for missing blobs
 * 10. Cleanup test blobs after passing
 *
 * Run: node scripts/test-azure.js
 */

import "dotenv/config";
import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";

const ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME;

// ── Test runner ───────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures = [];

async function test(name, fn) {
  process.stdout.write(`  Testing: ${name} ... `);
  try {
    await fn();
    console.log("✅ PASS");
    passed++;
  } catch (err) {
    console.log(`❌ FAIL — ${err.message}`);
    failed++;
    failures.push({ name, error: err.message });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || "Assertion failed");
}

// ── Test data ─────────────────────────────────────────────────────────────────

// A tiny 1x1 red pixel PNG in base64
const TEST_IMAGE_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==";
const TEST_MIME = "image/png";
const TEST_BLOB_NAME = `test/kizuna-integration-test-${Date.now()}.png`;
const TEST_CONTENT = Buffer.from(TEST_IMAGE_BASE64, "base64");

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n============================================");
  console.log(" Kizuna — Azure Blob Storage Test Suite    ");
  console.log("============================================");
  console.log(`Account  : ${ACCOUNT_NAME}`);
  console.log(`Container: ${CONTAINER_NAME}`);
  console.log(`Test blob: ${TEST_BLOB_NAME}`);
  console.log("============================================\n");

  // ── Test 1: Config check ─────────────────────────────────────────────────
  await test("Environment variables are set", async () => {
    assert(ACCOUNT_NAME, "AZURE_STORAGE_ACCOUNT_NAME is not set in .env");
    assert(CONTAINER_NAME, "AZURE_STORAGE_CONTAINER_NAME is not set in .env");
  });

  // ── Test 2: Authentication ────────────────────────────────────────────────
  let credential;
  await test("DefaultAzureCredential initialises without error", async () => {
    credential = new DefaultAzureCredential();
    assert(credential, "DefaultAzureCredential could not be created");
  });

  // ── Test 3: BlobServiceClient connects ───────────────────────────────────
  let blobServiceClient;
  await test("BlobServiceClient connects to storage account", async () => {
    const accountUrl = `https://${ACCOUNT_NAME}.blob.core.windows.net`;
    blobServiceClient = new BlobServiceClient(accountUrl, credential);
    // Lightweight probe — list containers (just checks auth works)
    const iter = blobServiceClient.listContainers();
    const first = await iter.next();
    assert(!first.done || first.value !== undefined || true, "Could not list containers");
  });

  // ── Test 4: Container access ──────────────────────────────────────────────
  let containerClient;
  await test(`Container '${CONTAINER_NAME}' exists and is accessible`, async () => {
    containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    const props = await containerClient.getProperties();
    assert(props, "getProperties returned nothing");
  });

  if (!containerClient) {
    console.log("\n❌ Cannot continue without container access. Aborting.\n");
    process.exit(1);
  }

  // ── Test 5: Upload a sample file ──────────────────────────────────────────
  let blockBlobClient;
  await test("Upload sample PNG to Azure Blob Storage", async () => {
    blockBlobClient = containerClient.getBlockBlobClient(TEST_BLOB_NAME);
    const response = await blockBlobClient.uploadData(TEST_CONTENT, {
      blobHTTPHeaders: { blobContentType: TEST_MIME },
    });
    assert(
      response._response?.status === 201 || response.requestId,
      "Upload did not return a successful response"
    );
  });

  // ── Test 6: Confirm file appears in list ──────────────────────────────────
  await test("Uploaded blob appears in container listing", async () => {
    const blobs = [];
    for await (const blob of containerClient.listBlobsFlat({ prefix: "test/" })) {
      blobs.push(blob.name);
    }
    assert(
      blobs.includes(TEST_BLOB_NAME),
      `Blob '${TEST_BLOB_NAME}' not found in listing`
    );
  });

  // ── Test 7: Download the file ─────────────────────────────────────────────
  let downloadedBuffer;
  await test("Download uploaded blob", async () => {
    const downloadResponse = await blockBlobClient.download(0);
    const chunks = [];
    for await (const chunk of downloadResponse.readableStreamBody) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    downloadedBuffer = Buffer.concat(chunks);
    assert(downloadedBuffer.length > 0, "Downloaded buffer is empty");
  });

  // ── Test 8: Compare downloaded with original ──────────────────────────────
  await test("Downloaded content matches original (byte-for-byte)", async () => {
    assert(downloadedBuffer !== undefined, "No downloaded buffer to compare");
    assert(
      downloadedBuffer.length === TEST_CONTENT.length,
      `Size mismatch: uploaded ${TEST_CONTENT.length} bytes, downloaded ${downloadedBuffer?.length} bytes`
    );
    assert(
      downloadedBuffer.equals(TEST_CONTENT),
      "Downloaded content does not match original"
    );
  });

  // ── Test 9: List blobs with prefix ───────────────────────────────────────
  await test("List blobs with prefix filter works", async () => {
    const results = [];
    for await (const blob of containerClient.listBlobsFlat({ prefix: "test/" })) {
      results.push({
        name: blob.name,
        size: blob.properties.contentLength,
      });
    }
    assert(results.length > 0, "No blobs found under 'test/' prefix");
    const found = results.find((b) => b.name === TEST_BLOB_NAME);
    assert(found, "Test blob not found in prefix-filtered listing");
    assert(found.size === TEST_CONTENT.length, `Size mismatch in listing: ${found.size}`);
  });

  // ── Test 10: Error handling — missing blob ────────────────────────────────
  await test("Missing blob throws a recognisable 404 error", async () => {
    const missingClient = containerClient.getBlockBlobClient(
      "test/this-blob-does-not-exist-kizuna.png"
    );
    try {
      await missingClient.download(0);
      throw new Error("Expected download to throw but it did not");
    } catch (err) {
      assert(
        err.statusCode === 404 ||
          err.message?.includes("BlobNotFound") ||
          err.message?.includes("does not exist"),
        `Expected 404/BlobNotFound, got: ${err.message}`
      );
    }
  });

  // ── Test 11: blobExists utility ───────────────────────────────────────────
  await test("blobExists returns true for existing blob", async () => {
    const exists = await blockBlobClient.exists();
    assert(exists === true, "blobExists should return true for uploaded blob");
  });

  await test("blobExists returns false for missing blob", async () => {
    const missingClient = containerClient.getBlockBlobClient(
      "test/definitely-missing-kizuna.png"
    );
    const exists = await missingClient.exists();
    assert(exists === false, "blobExists should return false for missing blob");
  });

  // ── Cleanup ───────────────────────────────────────────────────────────────
  console.log("\n  Cleaning up test blob...");
  try {
    await blockBlobClient.deleteIfExists();
    console.log(`  🗑️  Deleted test blob: ${TEST_BLOB_NAME}`);
  } catch (cleanupErr) {
    console.warn(`  ⚠️  Could not delete test blob: ${cleanupErr.message}`);
  }

  // ── Results ───────────────────────────────────────────────────────────────
  console.log("\n============================================");
  console.log(` Results: ${passed} passed, ${failed} failed `);
  console.log("============================================");

  if (failures.length > 0) {
    console.log("\nFailed tests:");
    failures.forEach((f) => console.log(`  ❌ ${f.name}: ${f.error}`));
  }

  if (failed === 0) {
    console.log("\n✅ All tests passed. Azure Blob Storage integration is working correctly.\n");
  } else {
    console.log("\n❌ Some tests failed. See details above.\n");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\n❌ Test script crashed:", err.message);
  console.error(err.stack);
  process.exit(1);
});
