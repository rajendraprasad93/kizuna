export const DEPARTMENT_NAME_ALIASES = {
  "Drainage Department": "Drainage & Water",
  "Roads Department": "Roads & Infrastructure", 
  "Sanitation Department": "Sanitation",
  "Emergency Response": "Emergency Services",
  "Electricity Department": "Emergency Services",
  "General Department": "Roads & Infrastructure", // Default fallback for General Department
};

export function canonicalDepartmentName(routerName) {
  if (!routerName || typeof routerName !== "string") return null;
  const trimmed = routerName.trim();
  return DEPARTMENT_NAME_ALIASES[trimmed] || trimmed;
}

export function validateReportCoordinates(body = {}) {
  if (body.latitude === undefined || body.latitude === null || body.latitude === "") {
    return "latitude is required";
  }
  if (body.longitude === undefined || body.longitude === null || body.longitude === "") {
    return "longitude is required";
  }
  const lat = Number(body.latitude);
  const lon = Number(body.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return "latitude and longitude must be numbers";
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return "latitude or longitude is out of range";
  }
  return null;
}
