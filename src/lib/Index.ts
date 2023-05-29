import Item from "../Item";

export type MetadataType = {
    [key: string]: string;
};

export class QueryResultItem {
    public dataId: string;
    public distance: number | null;
}

export class QueryResult {
    items: QueryResultItem[];
    queryVector: number[];
    maxDistance: number | undefined;
    where: MetadataType | undefined;

    constructor(queryVector: number[], maxDistance: number | undefined, where: MetadataType | undefined) {
        this.queryVector = queryVector;;
        this.maxDistance = maxDistance;
        this.where = where;
        this.items = [];
    }
}

export class IndexKey {
    dataId: string;
    metadata: MetadataType;
    vector: number[];
}

export abstract class Index {
    distanceFunction: (a: number[], b: number[]) => number; 

    constructor(distanceFunction: (a: number[], b: number[]) => number) {
        this.distanceFunction = distanceFunction;
    }

    abstract addItem(item: Item): void;
    abstract removeItem(id: string): void;
    abstract buildIndex(): void;
    abstract query(queryVector: number[], maxResults: number, maxDistance?: number, where?: MetadataType): QueryResult;

    protected filterByMetadata(item: IndexKey, where?: Record<string, any> | undefined): boolean {
        if(!where) {
            return true;
        }
        for (const key in where) {
            if (item.metadata[key] !== where[key]) {
                return false;
            }
        }
        return true;
    }
}

export enum IndexType {
    BRUTE_FORCE
}