import EuclideanDistance from './metrics/EuclideanDistance';
import CosineSimilarity from './metrics/CosineSimilarity';
import JaccardSimilarity from './metrics/JaccardSimilarity';
import { Metric } from './metrics/Metric';
import Item from './Item';
import { KDTree } from './lib/KDTree';
import { Index, IndexType, MetadataType } from './lib/Index';
import { KDTreeIndex } from './lib/KDTreeIndex';
import { BruteForceIndex } from './lib/BruteForceIndex';
import { KDTreePQIndex } from './lib/kdtree/KDTreePQIndex';

export default class Collection {
    private name: string;
    private data: Map<string, Item>;
    private useKdTree: boolean;
    private indices: Map<IndexType, Index>;
    private indexTypes: IndexType[];
    private metric: Metric;

    constructor(name: string, metric: Metric = Metric.EUCLIDEAN, indicies: IndexType[] = [IndexType.BRUTE_FORCE]) {
        this.name = name;
        this.data = new Map();
        this.metric = metric;
        this.indexTypes = indicies;
        this.indices = new Map();

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

        this.indices.forEach(index => {
            index.addItem(item);
        });

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
        where?: MetadataType | undefined,
        indexType: IndexType = IndexType.BRUTE_FORCE,
    ): Item[][] {
        const index = this.indices.get(indexType);
        if(!index)
            throw new Error(`Unsupported index: ${indexType}`);

        index.buildIndex();

        const result = query_embeddings.map((query_embedding) => {
            const nearest = index.query(query_embedding, n_results, undefined, where);
            return nearest.items.map(item => this.data.get(item.dataId)).filter((item): item is Item => item !== undefined) as Item[];
        });

        return result;
    }

    delete(id: string): void {
        this.data.delete(id);

        this.indices.forEach(index => {
            index.removeItem(id);
        });
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
        this.indexTypes.forEach(type => {
            if(type == IndexType.BRUTE_FORCE)
                this.indices.set(type,  new BruteForceIndex( this.getDistanceFunction(this.metric)));
            else
                throw new Error(`Unsupported index: ${type}`);
        });
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