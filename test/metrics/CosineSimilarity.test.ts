import CosineSimilarity from '../../src/metrics/CosineSimilarity';

describe('CosineSimilarity', () => {
    test('similarity', () => {
        const a = [1, 2, 3];
        const b = [4, 5, 6];
        const result = CosineSimilarity.distance(a, b);
        expect(result).toBeCloseTo(0.025368153802923787);
    });
});
