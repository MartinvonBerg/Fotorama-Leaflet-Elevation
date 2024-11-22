import { calcdistance, calc3DDistance } from './distance'; // Update the path to the location of your function

describe('calcdistance', () => {
    test('calculates distance between two points at sea level', () => {
        const lat1 = 0;
        const lon1 = 0;
        const lat2 = 0;
        const lon2 = 1;

        const distance = calcdistance(lat1, lon1, lat2, lon2);
        
        // Expected distance should be calculated based on the haversine formula
        expect(distance).toBeCloseTo(111.195, 3); // Approximate distance between two points on the equator
    });
    
    test('calculates distance between two identical points', () => {
        const lat1 = 0;
        const lon1 = 0;
        const lat2 = 0;
        const lon2 = 0;

        const distance = calcdistance(lat1, lon1, lat2, lon2);
        
        // Distance between identical points should be 0
        expect(distance).toBeCloseTo(0, 3);
    });

    test('calculates distance between two far points', () => {
        let lat1 = 51.5007;
        let lon1 = 0.1246;
        let lat2 = 40.6892;
        let lon2 = 74.0445;

        const distance = calcdistance(lat1, lon1, lat2, lon2);
        
        // Distance between identical points should be 0
        expect(distance).toBeCloseTo(5574.840456848555, 3);
    });
});

describe('calc3DDistance', () => {
    test('calculates distance between two points at sea level', () => {
        const lat1 = 0;
        const lon1 = 0;
        const alt1 = 0;
        const lat2 = 0;
        const lon2 = 1;
        const alt2 = 0;

        const distance = calc3DDistance(lat1, lon1, alt1, lat2, lon2, alt2);
        
        // Expected distance should be calculated based on the haversine formula
        expect(distance).toBeCloseTo(111.195, 3); // Approximate distance between two points on the equator
    });
    
    test('calculates distance between two identical points', () => {
        const lat1 = 0;
        const lon1 = 0;
        const alt1 = 0;
        const lat2 = 0;
        const lon2 = 0;
        const alt2 = 0;

        const distance = calc3DDistance(lat1, lon1, alt1, lat2, lon2, alt2);
        
        // Distance between identical points should be 0
        expect(distance).toBeCloseTo(0, 3);
    });

    test('calculates distance between two far points', () => {
        let lat1 = 51.5007;
        let lon1 = 0.1246;
        let alt1 = 0;
        let lat2 = 40.6892;
        let lon2 = 74.0445;
        let alt2 = 0;

        const distance = calc3DDistance(lat1, lon1, alt1, lat2, lon2, alt2);
        
        // Distance between identical points should be 0
        expect(distance).toBeCloseTo(5574.840456848555, 3);
    });
    
    test('calculates distance between two points with different altitudes', () => {
        const lat1 = 0;
        const lon1 = 0;
        const alt1 = 0;
        const lat2 = 0;
        const lon2 = 1;
        const alt2 = 1000;

        const distance = calc3DDistance(lat1, lon1, alt1, lat2, lon2, alt2);

        // Calculate expected distance using Pythagorean theorem
        const horizontalDistance = 111.195; // Distance between lat1, lon1 and lat2, lon2 at sea level in km
        const verticalDistance = (alt2-alt1)/1000; // Altitude difference in km
        const expectedDistance = Math.sqrt(Math.pow(horizontalDistance, 2) + Math.pow(verticalDistance, 2));

        // Expect the calculated distance to be close to the expected 3D distance
        expect(distance).toBeCloseTo(expectedDistance, 3);
    });
    
    test('calculates distance between two points with large altitude differences', () => {
        const lat1 = 0;
        const lon1 = 0;
        const alt1 = 0;
        const lat2 = 0;
        const lon2 = 1;
        const alt2 = 10000; // Large altitude difference (e.g., 10,000 meters)

        const distance = calc3DDistance(lat1, lon1, alt1, lat2, lon2, alt2);

        // Calculate expected distance with larger altitude difference
        const horizontalDistance = 111.195; // Approximate horizontal distance
        const verticalDistance = (alt2-alt1)/1000; // Altitude difference
        const expectedDistance = Math.sqrt(Math.pow(horizontalDistance, 2) + Math.pow(verticalDistance, 2));

        // Expect the calculated distance to be close to the expected 3D distance
        expect(distance).toBeCloseTo(expectedDistance, 3);
    });
    
});
