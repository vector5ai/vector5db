export default class JaccardSimilarity {
    static distance(a: number[], b: number[]): number {
        const setA = new Set(a);
        const setB = new Set(b);
        const intersection = new Set([...setA].filter((x) => setB.has(x))).size;
        const union = new Set([...setA, ...setB]).size;

        return 1 - (intersection / union);
    }
}
