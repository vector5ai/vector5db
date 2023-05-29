import Item from "../../Item";
import { Index, IndexKey, QueryResult, QueryResultItem, MetadataType } from  "../Index";
import CosineSimilarity from "../../metrics/CosineSimilarity";

export class LSHIndex implements Index {
    private items: IndexKey[] = [];
    private L: number;
    private K: number;
    private W: number;
    private hashTables: number[][][] = [];

    constructor(L: number = 10, K: number = 5, W: number = 2) {
        this.L = L;
        this.K = K;
        this.W = W;
    }

    addItem(item: Item): void {
        const indexKey = new IndexKey();
        indexKey.dataId = item.id;
        indexKey.metadata = item.metadata;
        indexKey.vector = item.vector;
        this.items.push(indexKey);
    }

    removeItem(id: string): void {
        this.items = this.items.filter(item => item.dataId !== id);
    }

    buildIndex(): void {
        // Create L hash tables
        for (let i = 0; i < this.L; i++) {
            // Create a random projection matrix for this hash table
            const randomVectors = this.createRandomVectors(this.K, this.items[0].vector.length);
    
            // Create the hash table
            const hashTable: number[][][] = [];
            for (const item of this.items) {
                // Project the item's vector onto the random vectors to get the hash key
                const hashKey = this.hash(randomVectors, item.vector);
                // Add the item to the corresponding bucket in the hash table
                if (!hashTable[hashKey]) {
                    hashTable[hashKey] = [];
                }
                hashTable[hashKey].push(item.vector);
            }
    
            // Add the hash table to the list of hash tables
            this.hashTables.push(hashTable);
        }
    }
    
    private createRandomVectors(K: number, dimensions: number): number[][] {
        const randomVectors: number[][] = [];
        for (let i = 0; i < K; i++) {
            const randomVector: number[] = [];
            for (let j = 0; j < dimensions; j++) {
                // Generate a random number from a normal distribution
                randomVector.push(this.normalRandom());
            }
            randomVectors.push(randomVector);
        }
        return randomVectors;
    }
    
    private normalRandom(): number {
        // Use the Box-Muller transform to generate a random number from a normal distribution
        const u1 = Math.random();
        const u2 = Math.random();
        return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    }
    
    private hash(randomVectors: number[][], vector: number[]): number {
        // Project the vector onto the random vectors and compute the hash key
        let hashKey = 0;
        for (let i = 0; i < randomVectors.length; i++) {
            const dotProduct = this.dotProduct(randomVectors[i], vector);
            if (dotProduct > 0) {
                hashKey |= (1 << i);
            }
        }
        return hashKey;
    }
    
    private dotProduct(a: number[], b: number[]): number {
        let dotProduct = 0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
        }
        return dotProduct;
    }

    query(queryVector: number[], distanceFunction: (a: number[], b: number[]) => number, maxResults: number, maxDistance?: number, where?: MetadataType): QueryResult {
        const resultItems: QueryResultItem[] = [];

        for (const item of this.items) {
            if (where && !this.filterByMetadata(item, where)) {
                continue;
            }

            const distance = distanceFunction(queryVector, item.vector);

            if (maxDistance && distance > maxDistance) {
                continue;
            }

            const resultItem = new QueryResultItem();
            resultItem.key = item;
            resultItem.distance = distance;
            resultItems.push(resultItem);

            if (resultItems.length >= maxResults) {
                break;
            }
        }

        const queryResult = new QueryResult();
        queryResult.items = resultItems;
        queryResult.queryVector = queryVector;
        queryResult.maxDistance = maxDistance || 0;
        queryResult.filter = where || {};

        return queryResult;
    }

    private filterByMetadata(item: IndexKey, where: Record<string, any>): boolean {
        for (const key in where) {
            if (item.metadata[key] !== where[key]) {
                return false;
            }
        }
        return true;
    }
}
