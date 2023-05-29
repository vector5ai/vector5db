import Item from "../Item";

export class KDNode {
    point: number[];
    item: Item;
    left: KDNode | null;
    right: KDNode | null;

    constructor(item: Item) {
        this.point = item.vector;
        this.item = item;
        this.left = null;
        this.right = null;
    }
}

export class KDTree {
    root: KDNode | null;

    constructor(items: Item[]) {
        this.root = this.buildTree(items, 0);
    }

    private buildTree(items: Item[], depth: number): KDNode | null {
        if (items.length === 0) {
            return null;
        }

        const k = items[0].vector.length;
        const axis = depth % k;
        items.sort((a, b) => a.vector[axis] - b.vector[axis]);

        const median = Math.floor(items.length / 2);
        const node = new KDNode(items[median]);

        node.left = this.buildTree(items.slice(0, median), depth + 1);
        node.right = this.buildTree(items.slice(median + 1), depth + 1);

        return node;
    }

    nearestNeighbor(queryPoint: number[], distanceFunction: (a: number[], b: number[]) => number, where: Record<string, any> = {}, n_results: number, maxDistance?: number): Item[] {
        let results: Item[] = [];
        this.searchNearest(this.root, queryPoint, distanceFunction, 0, where, results, n_results, maxDistance);
        return results;
    }

    private searchNearest(node: KDNode | null, queryPoint: number[], distanceFunction: (a: number[], b: number[]) => number, depth: number, where: Record<string, any>, results: Item[], n_results: number, maxDistance?: number): void {
        if (!node) {
            return;
        }

        const k = queryPoint.length;
        const axis = depth % k;
        const nextBranch = queryPoint[axis] < node.point[axis] ? node.left : node.right;
        const oppositeBranch = nextBranch === node.left ? node.right : node.left;
        node.item.distance = node.item.distance || distanceFunction(queryPoint, node.point);

        const addResult = (item: Item) => {
            results.push(item);
            results.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? 0));
            if (results.length > n_results) {
                results.pop();
            }
        }

        if (nextBranch === null && oppositeBranch == null) {
            if (this.filterByMetadata(node.item, where)) {
                if ((maxDistance === undefined || node.item.distance <= maxDistance) && (results.length < n_results || node.item.distance < (results[results.length - 1].distance ?? Infinity))) {
                    addResult(node.item)
                }
            }

            return;
        }

        this.searchNearest(nextBranch, queryPoint, distanceFunction, depth + 1, where, results, n_results, maxDistance);

        if (this.filterByMetadata(node.item, where)) {
            if ((maxDistance === undefined || node.item.distance <= maxDistance) && (results.length < n_results || node.item.distance < (results[results.length - 1].distance ?? Infinity))) {
                addResult(node.item);
            }
        }

        if (results.length < n_results || Math.abs(queryPoint[axis] - node.point[axis]) < (results[results.length - 1]?.distance ?? Infinity)) {
            this.searchNearest(oppositeBranch, queryPoint, distanceFunction, depth + 1, where, results, n_results, maxDistance);
        }
    }

    private filterByMetadata(item: Item, where: Record<string, any>): boolean {
        for (const key in where) {
            if (item.metadata[key] !== where[key]) {
                return false;
            }
        }
        return true;
    }
}