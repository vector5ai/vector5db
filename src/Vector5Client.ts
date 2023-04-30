import { Item } from './Item';
import { EuclideanDistance } from './metrics/EuclideanDistance';
import { CosineSimilarity } from './metrics/CosineSimilarity';
import { JaccardSimilarity } from './metrics/JaccardSimilarity';
import { Metric } from './metrics/Metrics';
import { KDTree } from './KDTree';

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
    private kdTree: KDTree;

    constructor(name: string) {
        this.name = name;
        this.data = new Map();
    }

    count(): number {
        return this.data.size;
    }

    add(id: string, vector: number[], metadata: Record<string, any>, document: string): void {
        const item: Item = { id, vector, metadata, document };
        this.data.set(id, item);
    
        if (this.kdTree) {
            this.kdTree.add(item);
        }
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
        this.ensureKDTree();
        const distanceFunction = this.getDistanceFunction(metric);

        return query_embeddings.map((query_embedding) => {
            const nearest = this.kdTree!.nearest(query_embedding, n_results, distanceFunction, where);
            return nearest;
        });
    }

    delete(id: string): void {
        const item = this.data.get(id);
    
        if (item && this.kdTree) {
            this.kdTree.remove(item);
        }
    
        this.data.delete(id);
    }

    distance(a: number[], b: number[], metric: Metric): number {
        switch (metric) {
            case Metric.EUCLIDEAN:
                return EuclideanDistance.distance(a, b);
            case 'cosine':
                return CosineSimilarity.distance(a, b);
            case 'jaccard':
                return JaccardSimilarity.distance(a, b);
            default:
                throw new Error(`Unsupported metric: ${metric}`);
        }
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
        return (a, b) => this.distance(a, b, metric);
    }

    private ensureKDTree(): void {
        if (!this.kdTree) {
            const dimensions = this.getDimensions();
            const itemsArray = Array.from(this.data.values());
            this.kdTree = new KDTree(itemsArray, dimensions);
        }
    }

    private getDimensions(): number {
        const firstItem = this.data.values().next().value;
        return firstItem ? firstItem.vector.length : 0;
    }
}