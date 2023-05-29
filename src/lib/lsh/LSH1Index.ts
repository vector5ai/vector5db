import Item from "../../Item";
import { Index, MetadataType } from "../Index";
import { LSH1 } from "./LSH1";

export class LSH1Index implements Index {
    lsh: LSH1;

    constructor() {
        this.lsh = LSH1Index();
    }

    addItem(item: Item): void {
        throw new Error("Method not implemented.");
    }
    removeItem(id: string): void {
        throw new Error("Method not implemented.");
    }
    buildIndex(): void {
        throw new Error("Method not implemented.");
    }
    query(queryVector: number[], distanceFunction: (a: number[], b: number[]) => number, maxResults: number, maxDistance?: number | undefined, where?: MetadataType | undefined) {
        throw new Error("Method not implemented.");
    }

}