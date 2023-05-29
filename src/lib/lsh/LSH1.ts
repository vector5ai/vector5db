export class LSH1 {
    private numBands: number;
    private rowsPerBand: number;
    private hashTables: Map<string, Set<number>>[];

    constructor(numBands: number, rowsPerBand: number) {
        this.numBands = numBands;
        this.rowsPerBand = rowsPerBand;
        this.hashTables = new Array(numBands * rowsPerBand).fill(null).map(() => new Map<string, Set<number>>());
    }

    // Helper function to generate a hash key for a vector
    private hashKey(vector: number[]): string {
        return vector.join('-');
    }

    // Insert a vector into the LSH
    insert(vector: number[]): void {
        for (let i = 0; i < this.numBands; i++) {
            const band = [];
            for (let j = 0; j < this.rowsPerBand; j++) {
                const rowIndex = i * this.rowsPerBand + j;
                const hashValue = this.hashKey(vector.slice(rowIndex, rowIndex + this.rowsPerBand));
                const table = this.hashTables[rowIndex];
                if (!table.has(hashValue)) {
                    table.set(hashValue, new Set());
                }
                table.get(hashValue)?.add(rowIndex);
                band.push(hashValue);
            }
        }
    }

    // Query similar vectors
    query(vector: number[]): Set<number> {
        const candidates = new Set<number>();
        for (let i = 0; i < this.numBands; i++) {
            const band = [];
            for (let j = 0; j < this.rowsPerBand; j++) {
                const rowIndex = i * this.rowsPerBand + j;
                const hashValue = this.hashKey(vector.slice(rowIndex, rowIndex + this.rowsPerBand));
                const table = this.hashTables[rowIndex];
                if (table.has(hashValue)) {
                    const bucket = table.get(hashValue);
                    bucket?.forEach(candidate => candidates.add(candidate));
                }
                band.push(hashValue);
            }
        }
        return candidates;
    }

    // Calculate the similarity between two vectors using LSH
    similarity(vectorA: number[], vectorB: number[]): number {
        const setA = this.query(vectorA);
        const setB = this.query(vectorB);
        return cosineSimilarity(vectorA, vectorB);
    }
}

const allVectors: number[][] = [
    [0.5, 0.2, 0.9, 0.1],
    [0.8, 0.3, 0.2, 0.6],
    [0.2, 0.6, 0.1, 0.9],
    [0.7, 0.4, 0.6, 0.3],
    [0.3, 0.1, 0.8, 0.4],
];

// Usage example
const lsh = new LSH(4, 4); // Create LSH with 4 bands and 4 rows per band

allVectors.forEach(vector => lsh.insert(vector));
console.log(lsh.hashTables);

// Query similar vectors
const similarVectors = lsh.query([0.6, 0.2, 0.7, 0.4]);
console.log('Similar vectors:', similarVectors);

// Extract and log the similar vectors
const similarVectorArray = Array.from(similarVectors).map(index => allVectors[index]);
console.log('Similar vectors to the query vector:', similarVectorArray);

similarVectorArray.map(vector => vector && console.log('Similarity between vectors:', lsh.similarity([0.6, 0.2, 0.7, 0.4], vector)))
