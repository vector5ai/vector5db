interface HashFunction {
    hash(point: number[]): string;
}

export class LSH2 {
    private hashFunctions: HashFunction[];
    private hashBuckets: Map<string, Set<string>>;
    private points: Map<string, number[]>

    constructor(dimensions: number) {
        // Define the number of hash functions you want to generate
        const numHashFunctions = 5;

        // Generate hash functions with universal coefficients
        const hashFunctions: HashFunction[] = [];
        for (let i = 0; i < numHashFunctions; i++) {
            const coefficients = this.generateUniversalHashCoefficients(dimensions);
            const hashFunction = new HashFunctionImpl(coefficients);
            hashFunctions.push(hashFunction);
        }

        this.hashFunctions = hashFunctions;
        this.hashBuckets = new Map();
        this.points = new Map();
    }

    addPoint(point: number[], id: string): void {
        this.points.set(id, point);
        for (const hashFunction of this.hashFunctions) {
            const hash = hashFunction.hash(point);
            if (!this.hashBuckets.has(hash)) {
                this.hashBuckets.set(hash, new Set());
            }
            this.hashBuckets.get(hash)?.add(id);
        }
    }

    getPointById(id: string) {
        return this.points.get(id);
    }

    removePoint(id: string): void {
        for (const hashBucket of this.hashBuckets.values()) {
            hashBucket.delete(id);
        }
    }

    query(queryPoint: number[], distanceFunction: (a: number[], b: number[]) => number, maxResults?:number, maxDistance?: number): string[] {
        const candidateIds = new Set<string>();
        for (const hashFunction of this.hashFunctions) {
            const hash = hashFunction.hash(queryPoint);
            console.log(hash);
            if (this.hashBuckets.has(hash)) {
                const bucket = this.hashBuckets.get(hash);
                if (bucket) {
                    for (const id of bucket.values()) {
                        candidateIds.add(id);
                    }
                }
            }
        }

        const result: { id: string, distance: number }[] = [];
        for (const id of candidateIds) {
            const point = this.getPointById(id);
            const distance = point && distanceFunction(queryPoint, point);
            // Add points to the results list if maxDistance is not provided
            if (distance !== undefined && (maxDistance === undefined || distance <= maxDistance)) {
                result.push({id: id, distance: distance});
            }
        }

        result.sort((a, b) => a.distance - b.distance);

        return result.slice(0, maxResults !== undefined ? maxResults : result.length).map(item => item.id);
    }

    // Generate universal hash function coefficients between 0 and 1
    private generateUniversalHashCoefficients(numCoefficients: number): number[] {
        const coefficients: number[] = [];
        for (let i = 0; i < numCoefficients; i++) {
            const coefficient = Math.random(); // Generate a random coefficient between 0 and 1
            coefficients.push(coefficient);
        }
        return coefficients;
    }
}

// Example usage:

// Define your hash function(s) based on your data distribution
class HashFunctionImpl implements HashFunction {
    private coefficients: number[];

    constructor(coefficients: number[]) {
        this.coefficients = coefficients;
    }

    hash(point: number[]): string {
        const hash = point.reduce((acc, value, index) => {
            return acc + this.coefficients[index] * value;
        }, 0);
        // Round off the hash value to make it more likely that similar points hash to the same bucket
        return hash.toFixed(2);
    }
}