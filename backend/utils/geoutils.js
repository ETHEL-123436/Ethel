/**
 * Calculate distance between two points in kilometers using the Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return parseFloat(distance.toFixed(2));
};

/**
 * Check if a point is within a certain radius of another point
 * @param {Object} point - The point to check { lat: number, lng: number }
 * @param {Object} center - The center point { lat: number, lng: number }
 * @param {number} radius - The radius in kilometers
 * @returns {boolean} True if the point is within the radius
 */
const isWithinRadius = (point, center, radius) => {
  const distance = calculateDistance(
    point.lat,
    point.lng,
    center.lat,
    center.lng
  );
  return distance <= radius;
};

/**
 * Calculate the bounding box coordinates for a point and radius
 * @param {number} lat - Latitude of the center point
 * @param {number} lng - Longitude of the center point
 * @param {number} radius - Radius in kilometers
 * @returns {Object} Bounding box coordinates { minLat, maxLat, minLng, maxLng }
 */
const getBoundingBox = (lat, lng, radius) => {
  const R = 6371; // Earth's radius in km
  
  // Convert latitude and longitude from degrees to radians
  const latRadian = lat * (Math.PI / 180);
  
  // Calculate the angular distance in radians on the great circle
  const dLat = radius / R * (180 / Math.PI);
  const dLng = radius / (R * Math.cos(latRadian)) * (180 / Math.PI);
  
  // Calculate the bounding box coordinates
  const minLat = lat - dLat;
  const maxLat = lat + dLat;
  const minLng = lng - dLng;
  const maxLng = lng + dLng;
  
  return { minLat, maxLat, minLng, maxLng };
};

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Convert radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
const toDegrees = (radians) => {
  return radians * (180 / Math.PI);
};

/**
 * Get a new coordinate based on start point, distance and bearing
 * @param {Object} start - Starting point { lat: number, lng: number }
 * @param {number} distance - Distance in kilometers
 * @param {number} bearing - Bearing in degrees (0-360)
 * @returns {Object} New coordinate { lat: number, lng: number }
 */
const getCoordinateAtDistance = (start, distance, bearing) => {
  const R = 6371; // Earth's radius in km
  const dR = distance / R; // Angular distance in radians
  const lat1 = toRadians(start.lat);
  const lng1 = toRadians(start.lng);
  const bearingRad = toRadians(bearing);
  
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(dR) +
    Math.cos(lat1) * Math.sin(dR) * Math.cos(bearingRad)
  );
  
  const lng2 = lng1 + Math.atan2(
    Math.sin(bearingRad) * Math.sin(dR) * Math.cos(lat1),
    Math.cos(dR) - Math.sin(lat1) * Math.sin(lat2)
  );
  
  return {
    lat: toDegrees(lat2),
    lng: (toDegrees(lng2) + 540) % 360 - 180 // Normalize to -180 to 180
  };
};

module.exports = {
  calculateDistance,
  isWithinRadius,
  getBoundingBox,
  toRadians,
  toDegrees,
  getCoordinateAtDistance
};
