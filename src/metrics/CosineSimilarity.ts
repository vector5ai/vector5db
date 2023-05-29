export default class CosineSimilarity {
    static distance(a: number[], b: number[]): number {
        const dotProduct = a.reduce((acc, value, index) => acc + value * b[index], 0);
        const magnitudeA = Math.sqrt(a.reduce((acc, value) => acc + Math.pow(value, 2), 0));
        const magnitudeB = Math.sqrt(b.reduce((acc, value) => acc + Math.pow(value, 2), 0));

        return 1 - (dotProduct / (magnitudeA * magnitudeB));
    }
}
