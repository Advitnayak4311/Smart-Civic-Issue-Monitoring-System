// Geocoding and coordinate resolution utility for Smart Civic System

const KNOWN_LOCATIONS = {
  // Uttara Kannada & Coastal Karnataka
  ankola: { lat: 14.6653, lng: 74.3003 },
  karwar: { lat: 14.8185, lng: 74.1300 },
  gokarna: { lat: 14.5479, lng: 74.3188 },
  kumta: { lat: 14.4258, lng: 74.4097 },
  honnavar: { lat: 14.2797, lng: 74.4439 },
  bhatkal: { lat: 13.9787, lng: 74.5513 },
  sirsi: { lat: 14.6195, lng: 74.8354 },
  dandeli: { lat: 15.2361, lng: 74.6229 },
  yellapur: { lat: 14.9644, lng: 74.7125 },
  haliyal: { lat: 15.3283, lng: 74.7597 },
  "uttara kannada": { lat: 14.8185, lng: 74.1300 },

  // Dakshina Kannada & Udupi
  mangaluru: { lat: 12.9141, lng: 74.8560 },
  mangalore: { lat: 12.9141, lng: 74.8560 },
  udupi: { lat: 13.3409, lng: 74.7421 },
  manipal: { lat: 13.3525, lng: 74.7865 },
  kundapura: { lat: 13.6264, lng: 74.6934 },
  puttur: { lat: 12.7667, lng: 75.2000 },
  bantwal: { lat: 12.8954, lng: 75.0345 },

  // Malnad & Central Karnataka
  chikkamagaluru: { lat: 13.3161, lng: 75.7720 },
  chikmagalur: { lat: 13.3161, lng: 75.7720 },
  shivamogga: { lat: 13.9299, lng: 75.5681 },
  shimoga: { lat: 13.9299, lng: 75.5681 },
  hassan: { lat: 13.0072, lng: 76.0963 },
  davanagere: { lat: 14.4644, lng: 75.9218 },
  chitradurga: { lat: 14.2251, lng: 76.3980 },

  // North Karnataka
  hubballi: { lat: 15.3647, lng: 75.1240 },
  hubli: { lat: 15.3647, lng: 75.1240 },
  dharwad: { lat: 15.4589, lng: 75.0078 },
  belagavi: { lat: 15.8497, lng: 74.4977 },
  belgaum: { lat: 15.8497, lng: 74.4977 },
  vijayapura: { lat: 16.8302, lng: 75.7100 },
  bijapur: { lat: 16.8302, lng: 75.7100 },
  bagalkote: { lat: 16.1691, lng: 75.6615 },
  kalaburagi: { lat: 17.3297, lng: 76.8343 },
  gulbarga: { lat: 17.3297, lng: 76.8343 },
  bidar: { lat: 17.9104, lng: 77.5199 },
  raichur: { lat: 16.2120, lng: 77.3439 },
  ballari: { lat: 15.1394, lng: 76.9214 },
  bellary: { lat: 15.1394, lng: 76.9214 },
  koppal: { lat: 15.3556, lng: 76.1550 },
  gadag: { lat: 15.4316, lng: 75.6355 },
  haveri: { lat: 14.7951, lng: 75.3991 },
  yadgir: { lat: 16.7697, lng: 77.1376 },

  // South Karnataka
  mysuru: { lat: 12.2958, lng: 76.6394 },
  mysore: { lat: 12.2958, lng: 76.6394 },
  mandya: { lat: 12.5218, lng: 76.8951 },
  madikeri: { lat: 12.4244, lng: 75.7382 },
  kodagu: { lat: 12.4244, lng: 75.7382 },
  coorg: { lat: 12.4244, lng: 75.7382 },
  chamarajanagar: { lat: 11.9261, lng: 76.9437 },
  tumakuru: { lat: 13.3401, lng: 77.1006 },
  tumkur: { lat: 13.3401, lng: 77.1006 },
  kolar: { lat: 13.1367, lng: 78.1291 },
  chikkaballapura: { lat: 13.4355, lng: 77.7315 },
  ramanagara: { lat: 12.7209, lng: 77.2799 },

  // Bengaluru Specific Localities
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  yelahanka: { lat: 13.1007, lng: 77.5963 },
  whitefield: { lat: 12.9698, lng: 77.7499 },
  indiranagar: { lat: 12.9784, lng: 77.6408 },
  koramangala: { lat: 12.9352, lng: 77.6245 },
  jayanagar: { lat: 12.9250, lng: 77.5938 },
  malleshwaram: { lat: 12.9968, lng: 77.5713 },
  hebbal: { lat: 13.0358, lng: 77.5970 },
  "electronic city": { lat: 12.8452, lng: 77.6602 },
  "hsr layout": { lat: 12.9121, lng: 77.6446 },
  marathahalli: { lat: 12.9591, lng: 77.6974 },
  rajajinagar: { lat: 12.9882, lng: 77.5548 },
  banashankari: { lat: 12.9255, lng: 77.5468 },

  // Major National Metros
  delhi: { lat: 28.6139, lng: 77.2090 },
  "new delhi": { lat: 28.6139, lng: 77.2090 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  hyderabad: { lat: 17.3850, lng: 78.4867 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  pune: { lat: 18.5204, lng: 73.8567 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  panaji: { lat: 15.4909, lng: 73.8278 },
  goa: { lat: 15.4909, lng: 73.8278 },
};

export const resolveCoordinates = async ({
  address = "",
  ward = "",
  city = "",
  district = "",
  state = "",
} = {}) => {
  // 1. Prioritize precise OpenStreetMap Nominatim geocoding for the specific address/landmark
  const specificAddress = (address || "").trim();
  const searchQueries = [];

  if (specificAddress) {
    searchQueries.push(`${specificAddress}, ${district || city || "Karnataka"}, India`);
    searchQueries.push(`${specificAddress}, India`);
  }
  if (ward && (district || city)) {
    searchQueries.push(`${ward}, ${district || city}, India`);
  }
  if (district || city) {
    searchQueries.push(`${district || city}, ${state || "Karnataka"}, India`);
  }

  for (const query of searchQueries) {
    if (!query || query.trim().length < 3) continue;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query.trim()
      )}&limit=1`;
      const res = await fetch(url, {
        headers: { "User-Agent": "SmartCivicIssueMonitor/1.0" },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        if (!isNaN(lat) && !isNaN(lon)) {
          return {
            latitude: lat,
            longitude: lon,
            source: "nominatim",
            matchedQuery: query,
          };
        }
      }
    } catch (e) {
      // Continue to next query if network/timeout occurs
    }
  }

  // 2. Fallback: Match against explicit district or city in known locations
  const targetTokens = [
    (district || "").toLowerCase().replace(/[^a-z0-9]/g, " "),
    (city || "").toLowerCase().replace(/[^a-z0-9]/g, " "),
    (address || "").toLowerCase().replace(/[^a-z0-9]/g, " "),
  ];

  for (const token of targetTokens) {
    if (!token) continue;
    for (const [key, coords] of Object.entries(KNOWN_LOCATIONS)) {
      const regex = new RegExp(`\\b${key}\\b`, "i");
      if (regex.test(token)) {
        return {
          latitude: coords.lat,
          longitude: coords.lng,
          source: "district-fallback",
          matchedKey: key,
        };
      }
    }
  }

  return null;
};

