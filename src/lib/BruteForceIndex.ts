import Item from "../Item";
import { Index, IndexKey, MetadataType, QueryResult } from "./Index"

export class BruteForceIndex extends Index {
    index: Map<string, IndexKey>;
    distanceFunction: (a: number[], b: number[]) => number;

    constructor(distanceFunction: (a: number[], b: number[]) => number) {
        super(distanceFunction);
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
    query(queryVector: number[], maxResults: number, maxDistance?: number | undefined, where?: MetadataType | undefined): QueryResult {
        let filteredItems = Array.from(this.index.values());

        if (where !== undefined) {
            filteredItems = filteredItems.filter((item) => this.filterByMetadata(item, where));
        }

        const itemsWithDistance = filteredItems.map((item) => ({
            ...item,
            distance: this.distanceFunction(queryVector, item.vector),
        }));

        itemsWithDistance.sort((a, b) => a.distance - b.distance);

        const result = new QueryResult(queryVector, maxDistance,  where);

        itemsWithDistance.slice(0, maxResults).forEach(item => result.items.push({ dataId: item.dataId, distance: item.distance }));
        return result;
    }
}