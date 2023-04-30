export interface Item {
    id: string;
    vector: number[];
    metadata: Record<string, any>;
    document: string;
}