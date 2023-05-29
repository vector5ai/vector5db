import { JaccardSimilarity } from '../../metrics/JaccardSimilarity';

describe('JaccardSimilarity', () => {
    test('similarity', () => {
        const a = [1, 2, 3];
        const b = [2, 3, 4];
        const result = JaccardSimilarity.distance(a, b);
        expect(result).toBeCloseTo(0.5);
    });

    test('no intersection', () => {
        const a = [1, 2, 3];
        const b = [4, 5, 6];
        const result = JaccardSimilarity.distance(a, b);
        expect(result).toBeCloseTo(1);
    });

    test('identical sets', () => {
        const a = [1, 2, 3];
        const b = [1, 2, 3];
        const result = JaccardSimilarity.distance(a, b);
        expect(result).toBeCloseTo(0);
    });
});
