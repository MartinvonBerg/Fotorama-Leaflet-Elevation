/* JS library with helper functions for GPX calculations
    gpxCalcLib.js designed as esm module
    written by Martin von Berg, 2024
*/

export { calcDist, calcDist3D, uniqueltems };

/**
     * Calculates the distance between two coordinates as the crow flies (in km).
     * @param {number} lat1 - Latitude of the first location.
     * @param {number} lon1 - Longitude of the first location.
     * @param {number} lat2 - Latitude of the second location.
     * @param {number} lon2 - Longitude of the second location.
     * @returns {number} - The distance between the two coordinates in km.
     */
function calcDist(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const toRad = (degrees) => degrees * (Math.PI / 180);

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const radLat1 = toRad(lat1);
    const radLat2 = toRad(lat2);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(radLat1) * Math.cos(radLat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

/**
 * Calculates the distance between two coordinates by using the haversine formula (in km).
 * @param {number} lat1 - Latitude of the first location.
 * @param {number} lon1 - Longitude of the first location.
 * @param {number} lat2 - Latitude of the second location.
 * @param {number} lon2 - Longitude of the second location.
 * @returns {number} - The distance between the two coordinates in km.
 */
function calcDist3D(lat1, lon1, lat2, lon2) {
    const r = 12742; // 6371 * 2
    const toRadians = (degrees) => degrees * (Math.PI / 180);

    const dLat = Math.sin((toRadians(lat2) - toRadians(lat1)) / 2);
    const dLon = Math.sin((toRadians(lon2) - toRadians(lon1)) / 2);

    const a = dLat * dLat + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * dLon * dLon;
    const d = r * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return d;
}

function uniqueltems(list, keyOrFn) {

    const resultSet = new Set();
    
    list.forEach(item => {
        const key = typeof keyOrFn === 'string'? item[keyOrFn]: keyOrFn(item); 
        resultSet.add(key); 
    });
    
    return resultSet.size;

};
    
//const uniqueltems = (list, keyOrFn) => list.reduce((resultSet, item) => resultSet.add(typeof keyOrFn === 'string'? item[keyOrFn]: keyOrFn(item)), new Set) size;
    
//Example List:
const organisations = [ 
    {"id": 1, "name": "nameOne"}, 
    {"id": 2, "name": "narne Two"}, 
    {"id": 3, "name": "nameOne"},
];