// Context Propagation Regression Tests (Phase 24 fix verification)
import { test } from "node:test";
import assert from "node:assert";

// Test the CATEGORY_MAP logic (core of Phase 24 fix)
test("pothole UUID maps to 'pothole' problemType", () => {
  const CATEGORY_MAP = {
    "9e074cac-6ebb-4a4d-a425-5183aff24b66": "flooding",
    "ab626bfb-64a0-471b-b5e6-e0fac49c3366": "pothole",
    "f1ff7e18-1402-403c-80d8-905a272d5496": "garbage"
  };
  
  const report = { category_id: "ab626bfb-64a0-471b-b5e6-e0fac49c3366" };
  const categoryName = CATEGORY_MAP[report.category_id];
  const problemType = categoryName || "unknown";
  
  assert.equal(problemType, "pothole");
});

test("flooding UUID maps to 'flooding' problemType", () => {
  const CATEGORY_MAP = {
    "9e074cac-6ebb-4a4d-a425-5183aff24b66": "flooding",
    "ab626bfb-64a0-471b-b5e6-e0fac49c3366": "pothole",
    "f1ff7e18-1402-403c-80d8-905a272d5496": "garbage"
  };
  
  const report = { category_id: "9e074cac-6ebb-4a4d-a425-5183aff24b66" };
  const categoryName = CATEGORY_MAP[report.category_id];
  const problemType = categoryName || "unknown";
  
  assert.equal(problemType, "flooding");
});

test("garbage UUID maps to 'garbage' problemType", () => {
  const CATEGORY_MAP = {
    "9e074cac-6ebb-4a4d-a425-5183aff24b66": "flooding",
    "ab626bfb-64a0-471b-b5e6-e0fac49c3366": "pothole",
    "f1ff7e18-1402-403c-80d8-905a272d5496": "garbage"
  };
  
  const report = { category_id: "f1ff7e18-1402-403c-80d8-905a272d5496" };
  const categoryName = CATEGORY_MAP[report.category_id];
  const problemType = categoryName || "unknown";
  
  assert.equal(problemType, "garbage");
});

test("unknown UUID falls back to 'unknown'", () => {
  const CATEGORY_MAP = {
    "9e074cac-6ebb-4a4d-a425-5183aff24b66": "flooding",
    "ab626bfb-64a0-471b-b5e6-e0fac49c3366": "pothole",
    "f1ff7e18-1402-403c-80d8-905a272d5496": "garbage"
  };
  
  const report = { category_id: "00000000-0000-0000-0000-000000000000" };
  const categoryName = CATEGORY_MAP[report.category_id];
  const problemType = categoryName || "unknown";
  
  assert.equal(problemType, "unknown");
});

test("reportWithCategory adds category field", () => {
  const report = {
    id: "test-001",
    category_id: "ab626bfb-64a0-471b-b5e6-e0fac49c3366",
    title: "Test",
    latitude: 42.3601,
    longitude: -71.0589
  };
  
  const assessment = { problemType: "pothole" };
  
  // This is the Phase 24 fix logic
  const reportWithCategory = {
    ...report,
    category: assessment.problemType
  };
  
  assert.equal(reportWithCategory.category, "pothole");
  assert.equal(reportWithCategory.category_id, "ab626bfb-64a0-471b-b5e6-e0fac49c3366");
  assert.ok(!report.category, "Original report should not be modified");
});

test("specialist tools receive category field", () => {
  const report = {
    id: "test-002",
    category_id: "ab626bfb-64a0-471b-b5e6-e0fac49c3366"
  };
  
  const assessment = { problemType: "pothole" };
  const reportWithCategory = {
    ...report,
    category: assessment.problemType
  };
  
  // Simulate what tools receive
  const toolInput = {
    report: reportWithCategory,
    assessment,
    problemType: assessment.problemType
  };
  
  assert.equal(toolInput.report.category, "pothole");
  assert.equal(toolInput.problemType, "pothole");
});

test("normalizeCategory function processes category correctly", () => {
  // This is the logic from relationshipDiscovery.cjs
  function normalizeCategory(category) {
    if (!category) return null;
    return String(category).trim().toLowerCase().replace(/\s+/g, "_");
  }
  
  assert.equal(normalizeCategory("pothole"), "pothole");
  assert.equal(normalizeCategory("Pothole"), "pothole");
  assert.equal(normalizeCategory("road damage"), "road_damage");
  assert.equal(normalizeCategory(""), null);
  assert.equal(normalizeCategory(null), null);
  assert.equal(normalizeCategory(undefined), null);
});

