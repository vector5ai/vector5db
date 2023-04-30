import { EuclideanDistance } from '../../metrics/EuclideanDistance';

describe('EuclideanDistance', () => {
    test('distance', () => {
        const a = [1, 2, 3];
        const b = [4, 5, 6];
        const result = EuclideanDistance.distance(a, b);
        expect(result).toBeCloseTo(5.196);
    });
});
