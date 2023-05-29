import Item from "../Item";
import { Index, IndexKey, MetadataType } from "./Index"

export class BruteForceIndex implements Index {
    index: Map<string, IndexKey>;

    constructor() {
        this.index = new Map();
    }

    addItem(item: Item): void {
        this.index.set(item.id, {
            dataId: item.id,
            vector: item.vector,
            metadata: item.metadata
        });
    }
    removeItem(id): void {
        this.index.delete(id);
    }
    buildIndex(): void {
        
    }
    query(queryVector: number[], distanceFunction: (a: number[], b: number[]) => number, maxResults: number, maxDistance?: number | undefined, where?: MetadataType | undefined) {
        let filteredItems = Array.from(this.index.values());

        if (where !== undefined) {
            filteredItems = filteredItems.filter((item) => this.filterByMetadata(item, where));
        }

        const itemsWithDistance = filteredItems.map((item) => ({
            ...item,
            distance: distanceFunction(queryVector, item.vector),
        }));

        itemsWithDistance.sort((a, b) => a.distance - b.distance);

        return itemsWithDistance.slice(0, maxResults);
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