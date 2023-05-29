import Item from "../Item";

export type MetadataType = {
    [key: string]: string;
};


export class IndexKey {
    dataId: string;
    metadata: MetadataType;
    vector: number[];
}

export class QueryResultItem {
    key: IndexKey;
    distance: number;
}

export class QueryResult {
    items: QueryResultItem[];
    queryVector: number[];
    maxDistance: number;
    filter: MetadataType
}

export interface Index {
    addItem(item: Item): void;
    removeItem(id: string): void;
    buildIndex(): void;
    query(queryVector: number[], distanceFunction: (a: number[], b: number[]) => number, maxResults: number, maxDistance?: number, where?: MetadataType)
}