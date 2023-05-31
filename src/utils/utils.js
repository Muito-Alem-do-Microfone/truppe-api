const calculateLocationRange = (lat, long, rangeInKm) => {
  const earthRadiusKm = 6371 // Earth's radius in kilometers

  // Convert latitude and longitude to radians
  const latRadian = lat * (Math.PI / 180)
  const lngRadian = long * (Math.PI / 180)

  // Calculate the angular distance in radians
  const angularDistance = rangeInKm / earthRadiusKm

  // Calculate latitude range
  const latDelta = angularDistance * (180 / Math.PI)
  const minLat = lat - latDelta
  const maxLat = lat + latDelta

  // Calculate longitude range
  const lngDelta = (angularDistance / Math.cos(latRadian)) * (180 / Math.PI)
  const minLng = long - lngDelta
  const maxLng = long + lngDelta

  // Return the latitude and longitude range as an object
  return {
    minLatitude: minLat,
    maxLatitude: maxLat,
    minLongitude: minLng,
    maxLongitude: maxLng
  };
}

module.exports = {
  calculateLocationRange
}