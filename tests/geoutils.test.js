const assert = require('node:assert');
const path = require('node:path');

// Import the utils using absolute path from project root
const geoutils = require(path.join(process.cwd(), 'backend', 'utils', 'geoutils.js'));

function testCalculateDistance() {
  // Paris (48.8566, 2.3522) to London (51.5074, -0.1278) ~ 343 km
  const d = geoutils.calculateDistance(48.8566, 2.3522, 51.5074, -0.1278);
  assert(Math.abs(d - 343) < 10, `Expected ~343km, got ${d}`);
}

function testIsWithinRadius() {
  const center = { lat: 48.8566, lng: 2.3522 }; // Paris
  const near = { lat: 48.8666, lng: 2.3622 };   // ~1.3km away
  const far = { lat: 49.8566, lng: 3.3522 };    // ~130km away
  assert(geoutils.isWithinRadius(near, center, 5) === true, 'Near should be within 5km');
  assert(geoutils.isWithinRadius(far, center, 5) === false, 'Far should not be within 5km');
}

function testBoundingBox() {
  const box = geoutils.getBoundingBox(0, 0, 10);
  // Rough sanity checks
  assert(box.minLat < 0 && box.maxLat > 0, 'Lat bounds should straddle 0');
  assert(box.minLng < 0 && box.maxLng > 0, 'Lng bounds should straddle 0');
}

function testRadiansDegrees() {
  assert.strictEqual(geoutils.toRadians(180), Math.PI);
  assert.strictEqual(geoutils.toDegrees(Math.PI), 180);
}

function testCoordinateAtDistance() {
  const start = { lat: 0, lng: 0 };
  const next = geoutils.getCoordinateAtDistance(start, 100, 90); // 100km east
  // New point should have positive longitude and near zero latitude
  assert(next.lng > 0, 'Expected positive longitude');
  assert(Math.abs(next.lat) < 1, 'Expected latitude near 0');
}

function run() {
  testCalculateDistance();
  testIsWithinRadius();
  testBoundingBox();
  testRadiansDegrees();
  testCoordinateAtDistance();
  console.log('All geoutils tests passed');
}

run();
