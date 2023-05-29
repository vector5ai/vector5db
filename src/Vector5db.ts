import Collection from "./Collection";
import { IndexType } from "./lib/Index";
import { Metric } from "./metrics/Metric";

export default class Vector5db {
    private collections: Map<string, Collection>;

    constructor() {
        this.collections = new Map();
    }

    listCollections(): string[] {
        return Array.from(this.collections.keys());
    }

    createCollection(name: string, metric: Metric = Metric.EUCLIDEAN, indicies: IndexType[] = [IndexType.BRUTE_FORCE]) {
        const collection = new Collection(name, metric, indicies);
        this.collections.set(name, collection);
        return collection;
    }

    getCollection(name: string): Collection | null {
        return this.collections.get(name) || null;
    }

    getOrCreateCollection(name: string): Collection {
        let collection = this.getCollection(name);
        if (!collection) {
            collection = this.createCollection(name);
        }
        return collection;
    }

    deleteCollection(name: string): void {
        this.collections.delete(name);
    }

    reset(): void {
        this.collections.clear();
    }
}