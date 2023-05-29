import Item from "../../Item";
import { Index, IndexKey, MetadataType, QueryResult, QueryResultItem } from "../Index"
import { KDTreePQ } from "./KDTreePQ";

export class KDTreePQIndex implements Index {
    index: Map<string, IndexKey>;
    kdTree: KDTreePQ;
    tempMap: Map<string, Item>;
    protected distanceFunction: (a: number[], b: number[]) => number;

    constructor(distanceFunction: (a: number[], b: number[]) => number) {
        this.index = new Map();
        this.tempMap = new Map();

        this.distanceFunction = distanceFunction;
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
        this.kdTree = new KDTreePQ(Array.from(this.tempMap.values()).map((item: Item) => item.vector), 3, 1, this.distanceFunction);

    }
    query(queryVector: number[], distanceFunction: (a: number[], b: number[]) => number, maxResults: number, maxDistance?: number | undefined, where?: MetadataType | undefined) {
        const nearest = this.kdTree.queryOriginalVectors(queryVector);
        const result = new QueryResult();
        result.queryVector = queryVector;
        result.maxDistance = maxDistance ?? Infinity;
        
        return nearest?.slice(0, maxResults);
    }
}