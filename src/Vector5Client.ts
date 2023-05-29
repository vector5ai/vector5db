import { EuclideanDistance } from './metrics/EuclideanDistance';
import { CosineSimilarity } from './metrics/CosineSimilarity';
import { JaccardSimilarity } from './metrics/JaccardSimilarity';
import { Metric } from './metrics/Metrics';

export class Vector5Client {
    private collections: Map<string, Collection>;

    constructor() {
        this.collections = new Map();
    }

    list_collections(): string[] {
        return Array.from(this.collections.keys());
    }

    create_collection(name: string): Collection {
        const collection = new Collection(name);
        this.collections.set(name, collection);
        return collection;
    }

    get_collection(name: string): Collection | null {
        return this.collections.get(name) || null;
    }

    get_or_create_collection(name: string): Collection {
        let collection = this.get_collection(name);
        if (!collection) {
            collection = this.create_collection(name);
        }
        return collection;
    }

    delete_collection(name: string): void {
        this.collections.delete(name);
    }

    reset(): void {
        this.collections.clear();
    }
}

export class Collection {
    private name: string;
    private data: Map<string, Item>;

    constructor(name: string) {
        this.name = name;
        this.data = new Map();
    }

    count(): number {
        return this.data.size;
    }

    add(
        id: string,
        vector: number[],
        metadata: Record<string, any>,
        document: string
    ): void {
        const item: Item = { id, vector, metadata, document };
        this.data.set(id, item);
    }

    get(id: string): Item | null {
        return this.data.get(id) || null;
    }

    peek(n: number = 5): Item[] {
        return Array.from(this.data.values()).slice(0, n);
    }

    query(
        query_embeddings: number[][],
        n_results: number = 1,
        metric: Metric = Metric.EUCLIDEAN,
        where: Record<string, any> = {}
    ): Item[][] {
        const distanceFunction = this.getDistanceFunction(metric);

        return query_embeddings.map((query_embedding) => {
            const itemsWithDistance = Array.from(this.data.values())
                .filter((item) => this.filterByMetadata(item, where))
                .map((item) => ({
                    ...item,
                    distance: distanceFunction(query_embedding, item.vector),
                }));

            itemsWithDistance.sort((a, b) => a.distance - b.distance);

            return itemsWithDistance.slice(0, n_results);
        });
    }

    delete(id: string): void {
        this.data.delete(id);
    }

    distance(a: number[], b: number[], metric: Metric): number {
        const distanceFunction = this.getDistanceFunction(metric);

        return distanceFunction(a, b)
    }

    nearestNeighbors(queryVector: number[], k: number, metric: Metric): Item[] {
        const itemsArray = Array.from(this.data.values());

        const distances = itemsArray.map((item) => ({
            ...item,
            distance: this.distance(queryVector, item.vector, metric),
        }));

        distances.sort((a, b) => a.distance - b.distance);

        return distances.slice(0, k);
    }

    private filterByMetadata(item: Item, where: Record<string, any>): boolean {
        for (const key in where) {
            if (item.metadata[key] !== where[key]) {
                return false;
            }
        }
        return true;
    }

    private getDistanceFunction(metric: Metric): (a: number[], b: number[]) => number {
        switch (metric) {
            case Metric.EUCLIDEAN:
                return EuclideanDistance.distance;
            case 'cosine':
                return CosineSimilarity.distance;
            case 'jaccard':
                return JaccardSimilarity.distance;
            default:
                throw new Error(`Unsupported metric: ${metric}`);
        }
    }
}

export interface Item {
    id: string;
    vector: number[];
    metadata: Record<string, any>;
    document: string;
}