import { calc3DDistance } from '../../../admin_rust_wasm/www/distance.js'; // Update the path to the location of your function

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
        expect(distance).toBeCloseTo(111.194, 3);
    });

    test('calculates distance between two points with different altitudes', () => {
        const lat1 = 0;
        const lon1 = 0;
        const alt1 = 0;
        const lat2 = 0;
        const lon2 = 1;
        const alt2 = 1000;

        const distance = calc3DDistance(lat1, lon1, alt1, lat2, lon2, alt2);
        
        // Expected distance should be calculated taking altitude into account
        const expectedDistance = Math.sqrt(Math.pow(111194, 2) + Math.pow(1000, 2))
    });
});
