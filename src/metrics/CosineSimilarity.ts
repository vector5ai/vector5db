export default class CosineSimilarity {
    static distance(a: number[], b: number[]): number {
        const dotProduct = a.reduce((acc, value, index) => acc + value * b[index], 0);
        const magnitudeA = Math.sqrt(a.reduce((acc, value) => acc + Math.pow(value, 2), 0));
        const magnitudeB = Math.sqrt(b.reduce((acc, value) => acc + Math.pow(value, 2), 0));

        return 1 - (dotProduct / (magnitudeA * magnitudeB));
    }
}


// function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
//     let dotProduct = 0;
//     let normA = 0;
//     let normB = 0;
//     for (let i = 0; i < vectorA.length; i++) {
//         dotProduct += vectorA[i] * vectorB[i];
//         normA += vectorA[i] ** 2;
//         normB += vectorB[i] ** 2;
//     }
//     normA = Math.sqrt(normA);
//     normB = Math.sqrt(normB);
//     return dotProduct / (normA * normB);
// }
