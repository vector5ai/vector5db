import Item from "../Item";
import { Index, IndexKey, MetadataType } from "./Index"
import { KDTree } from "./KDTree";

export class KDTreeIndex implements Index {
    index: Map<string, IndexKey>;
    kdTree: KDTree;
    tempMap: Map<string, Item>;

    constructor() {
        this.index = new Map();
        this.tempMap = new Map();
    }
    
    addItem(item: Item): void {
        this.index.set(item.id, {
            dataId: item.id,
            vector: item.vector,
            metadata: item.metadata
        });
        this.tempMap.set(item.id, item);
    }
    removeItem(id): void {
        this.index.delete(id);
        this.tempMap.delete(id);
    }
    buildIndex(): void {
        this.kdTree = new KDTree(Array.from(this.tempMap.values()));
    }
    query(queryVector: number[], distanceFunction: (a: number[], b: number[]) => number, maxResults: number, maxDistance?: number | undefined, where?: MetadataType | undefined) {
        const nearest = this.kdTree.nearestNeighbor(queryVector, distanceFunction, where, maxResults);

        return nearest.map(item =>
            this.index.get(item.id)
        );
    }
}