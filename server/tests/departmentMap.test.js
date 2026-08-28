import test from "node:test";
import assert from "node:assert/strict";
import {
  canonicalDepartmentName,
  validateReportCoordinates,
} from "../departmentMap.js";

test("Drainage Department maps to seeded Drainage & Water", () => {
  assert.equal(
    canonicalDepartmentName("Drainage Department"),
    "Drainage & Water",
  );
});

test("Roads and Sanitation router names map to seed names", () => {
  assert.equal(
    canonicalDepartmentName("Roads Department"),
    "Roads & Infrastructure",
  );
  assert.equal(canonicalDepartmentName("Sanitation Department"), "Sanitation");
});

test("already-canonical seed names pass through", () => {
  assert.equal(canonicalDepartmentName("Drainage & Water"), "Drainage & Water");
});

test("missing coordinates return a validation error", () => {
  assert.equal(validateReportCoordinates({}), "latitude is required");
  assert.equal(
    validateReportCoordinates({ latitude: 12.97 }),
    "longitude is required",
  );
});

test("valid coordinates pass validation", () => {
  assert.equal(
    validateReportCoordinates({ latitude: 12.9716, longitude: 77.5946 }),
    null,
  );
});
