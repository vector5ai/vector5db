import EuclideanDistance from './metrics/EuclideanDistance';
import CosineSimilarity from './metrics/CosineSimilarity';
import JaccardSimilarity from './metrics/JaccardSimilarity';
import { Metric } from './metrics/Metric';
import Item from './Item';
import { KDTree } from './lib/KDTree';
import { Index, IndexKey } from './lib/Index';
import { KDTreeIndex } from './lib/KDTreeIndex';
import { BruteForceIndex } from './lib/BruteForceIndex';

export default class Collection {
    private name: string;
    private data: Map<string, Item>;
    private useKdTree: boolean;
    // private indices: Map<string, Index>;
    private index: Index;

    constructor(name: string, useKdTree: boolean = true) {
        this.name = name;
        this.data = new Map();
        this.useKdTree = useKdTree;

        this.initIndices();
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

        this.index.addItem(item);
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
        console.log(this.index.constructor.name);
        const distanceFunction = this.getDistanceFunction(metric);

        this.index.buildIndex();

        return query_embeddings.map((query_embedding) => {
            const nearest = this.index.query(query_embedding, distanceFunction, n_results, undefined, where);
            return nearest.map(item => this.data.get(item.dataId));
        });

    }

    delete(id: string): void {
        this.data.delete(id);

        this.index.removeItem(id);
    }

    reset(): void {
        this.data.clear();
        this.initIndices();
    }

    distance(a: number[], b: number[], metric: Metric = Metric.EUCLIDEAN): number {
        const distanceFunction = this.getDistanceFunction(metric);

        return distanceFunction(a, b)
    }

    static filterByMetadata(item: Item, where: Record<string, any>): boolean {
        for (const key in where) {
            if (item.metadata[key] !== where[key]) {
                return false;
            }
        }
        return true;
    }

    private initIndices(): void {
        if (this.useKdTree) {
            this.index = new KDTreeIndex();
        } else {
            this.index = new BruteForceIndex();
        }
    }

    private getDistanceFunction(metric: Metric = Metric.EUCLIDEAN): (a: number[], b: number[]) => number {
        switch (metric) {
            case Metric.EUCLIDEAN:
                return EuclideanDistance.distance;
            case Metric.COSINE:
                return CosineSimilarity.distance;
            case Metric.JACCARD:
                return JaccardSimilarity.distance;
            default:
                throw new Error(`Unsupported metric: ${metric}`);
        }
    }
}