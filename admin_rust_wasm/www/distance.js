/**
 * Calculates the distance between two coordinates by using the haversine formula (in km).
 * @param {number} lat1 - Latitude of the first location.
 * @param {number} lon1 - Longitude of the first location.
 * @param {number} lat2 - Latitude of the second location.
 * @param {number} lon2 - Longitude of the second location.
 * @returns {number} - The distance between the two coordinates in km.
 */
export function calcdistance(lat1, lon1, lat2, lon2) {
    const r = 12742; // 6371 * 2
    const toRadians = (degrees) => degrees * 0.017453292519943295; //(Math.PI / 180);

    const dLat = Math.sin((toRadians(lat2) - toRadians(lat1)) / 2);
    const dLon = Math.sin((toRadians(lon2) - toRadians(lon1)) / 2);

    const a = dLat * dLat + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * dLon * dLon;
    const d = r * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return d;
}

/**
 * Calculates the distance between two coordinates by using the haversine formula (in km) including altitude.
 * @param {number} lat1 - Latitude of the first location.
 * @param {number} lon1 - Longitude of the first location.
 * @param {number} alt1 - Altitude of the first location in Meters.
 * 
 * @param {number} lat2 - Latitude of the second location.
 * @param {number} lon2 - Longitude of the second location.
 * @param {number} alt2 - Altitude of the second location in Meters.
 * 
 * @returns {number} - The distance between the two coordinates in km.
 */
export function calc3DDistance(lat1, lon1, alt1=0, lat2, lon2, alt2=0) {
    const r = 12742; // 6371 * 2
    const toRadians = (degrees) => degrees * 0.017453292519943295; //(Math.PI / 180);

    const dLat = Math.sin((toRadians(lat2) - toRadians(lat1)) / 2);
    const dLon = Math.sin((toRadians(lon2) - toRadians(lon1)) / 2);

    const a = dLat * dLat + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * dLon * dLon;
    const d = r * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // m
        
    const distance = Math.sqrt( Math.pow(d, 2) + Math.pow(alt2 - alt1, 2) );
    
    return distance;
}