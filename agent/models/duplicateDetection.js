const haversineKm = (a, b) => {
  if (!a || !b || a.latitude == null || b.latitude == null)
    return Number.POSITIVE_INFINITY;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(x));
};

const duplicateDetection = {
  async findDuplicates(report, allReports = []) {
    const matches = (allReports || [])
      .filter((candidate) => {
        if (!candidate || candidate.id === report?.id) return false;
        
        // Temporal decay: reject reports older than 48 hours
        const timeGapHours = Math.abs(
          new Date(report?.created_at) - new Date(candidate.created_at)
        ) / (1000 * 60 * 60);
        if (timeGapHours > 48) return false;
        
        // Semantic category equivalence
        const exactMatch = candidate.category === report?.category;
        const wasteBridge = 
          (candidate.category === "garbage" && report?.category === "sanitation_issue") ||
          (candidate.category === "sanitation_issue" && report?.category === "garbage");
        const roadBridge =
          (candidate.category === "pothole" && report?.category === "road_damage") ||
          (candidate.category === "road_damage" && report?.category === "pothole");
        // Sewage drainage bridge (bidirectional) - same underlying sewage system issue
        // Note: flooding + blocked_drain is NOT included - these are cause/effect, not duplicates
        const sewerBridge =
          (report?.category === "sanitation_issue" && candidate.category === "blocked_drain") ||
          (report?.category === "blocked_drain" && candidate.category === "sanitation_issue");
        
        const categoriesMatch = exactMatch || wasteBridge || roadBridge || sewerBridge;
        
        const proximityKm = haversineKm(report, candidate);
        return categoriesMatch && proximityKm <= 0.5;
      })
      .map((candidate) => ({
        id: candidate.id,
        category: candidate.category,
        distance_km: Number(haversineKm(report, candidate).toFixed(3)),
        latitude: candidate.latitude,
        longitude: candidate.longitude,
      }));

    return {
      is_duplicate: matches.length > 0,
      all_duplicates: matches,
      confidence: matches.length > 0 ? 0.89 : 0.12,
      matched_reports: matches.length,
      summary:
        matches.length > 0
          ? `${matches.length} similar report(s) detected nearby.`
          : "No duplicate reports detected.",
    };
  },
};

export default duplicateDetection;
