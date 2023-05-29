import EuclideanDistance from './metrics/EuclideanDistance';
import CosineSimilarity from './metrics/CosineSimilarity';
import JaccardSimilarity from './metrics/JaccardSimilarity';
import { Metric } from './metrics/Metric';
import Item from './Item';

export default class Collection {
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

    reset(): void {
        this.data.clear();
    }

    distance(a: number[], b: number[], metric: Metric = Metric.EUCLIDEAN): number {
        const distanceFunction = this.getDistanceFunction(metric);

        return distanceFunction(a, b)
    }

    nearestNeighbors(queryItem: Item, k: number, metric: Metric = Metric.EUCLIDEAN): Item[] {
        const itemsArray = Array.from(this.data.values());

        const distances = itemsArray.map((item) => ({
            ...item,
            distance: this.distance(queryItem.vector, item.vector, metric),
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