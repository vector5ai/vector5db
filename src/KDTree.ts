import { Item } from './Item';

type KDTreeNode = {
    item: Item;
    left: KDTreeNode | null;
    right: KDTreeNode | null;
};

export class KDTree {
    private root: KDTreeNode | null;
    private dimensions: number;

    constructor(items: Item[], dimensions: number) {
        this.dimensions = dimensions;
        this.root = this.buildTree(items, 0);
    }

    nearest(
        target: number[],
        n_results: number,
        metric: (a: number[], b: number[]) => number,
        where: Record<string, any> = {}
    ): Item[] {
        const results: Array<[Item, number]> = [];
        this._nearest(this.root, target, 0, metric, where, results);

        results.sort((a, b) => a[1] - b[1]);
        return results.slice(0, n_results).map(([item, _]) => item);
    }

    add(item: Item): void {
        this.root = this.insert(this.root, item, 0);
    }

    remove(item: Item): void {
        this.root = this.deleteNode(this.root, item, 0);
    }

    private buildTree(items: Item[], depth: number): KDTreeNode | null {
        if (items.length === 0) {
            return null;
        }

        const axis = depth % this.dimensions;
        items.sort((a, b) => a.vector[axis] - b.vector[axis]);

        const median = Math.floor(items.length / 2);
        const node: KDTreeNode = {
            item: items[median],
            left: this.buildTree(items.slice(0, median), depth + 1),
            right: this.buildTree(items.slice(median + 1), depth + 1),
        };

        return node;
    }

    private filterByMetadata(item: Item, where: Record<string, any>): boolean {
        for (const key in where) {
            if (item.metadata[key] !== where[key]) {
                return false;
            }
        }
        return true;
    }

    private _nearest(
        node: KDTreeNode | null,
        target: number[],
        depth: number,
        metric: (a: number[], b: number[]) => number,
        where: Record<string, any>,
        results: Array<[Item, number]>
    ): void {
        if (!node) {
            return;
        }

        if (this.filterByMetadata(node.item, where)) {
            const distance = metric(target, node.item.vector);
            results.push([node.item, distance]);
        }

        const axis = depth % this.dimensions;
        const diff = target[axis] - node.item.vector[axis];
        const nextNode = diff <= 0 ? node.left : node.right;
        const otherNode = diff <= 0 ? node.right : node.left;

        this._nearest(nextNode, target, depth + 1, metric, where, results);

        if (results.length > 0 && Math.abs(diff) < results[results.length - 1][1]) {
            this._nearest(otherNode, target, depth + 1, metric, where, results);
        }
    }

    private insert(node: KDTreeNode | null, item: Item, depth: number): KDTreeNode {
        if (!node) {
            return { item, left: null, right: null };
        }

        const dimension = depth % this.dimensions;
        if (item.vector[dimension] < node.item.vector[dimension]) {
            node.left = this.insert(node.left, item, depth + 1);
        } else {
            node.right = this.insert(node.right, item, depth + 1);
        }

        return node;
    }

    private deleteNode(node: KDTreeNode | null, item: Item, depth: number): KDTreeNode | null {
        if (!node) {
            return null;
        }

        if (node.item.id === item.id) {
            // Node with only one child or no child
            if (!node.left) {
                return node.right;
            } else if (!node.right) {
                return node.left;
            }

            // Node with two children: Get the inorder successor (smallest in the right subtree)
            node.item = this.minValue(node.right);

            // Delete the inorder successor
            node.right = this.deleteNode(node.right, node.item, depth + 1);
        } else {
            const dimension = depth % this.dimensions;
            if (item.vector[dimension] < node.item.vector[dimension]) {
                node.left = this.deleteNode(node.left, item, depth + 1);
            } else {
                node.right = this.deleteNode(node.right, item, depth + 1);
            }
        }

        return node;
    }

    // Helper function to find the smallest item in the tree rooted at the given node
    private minValue(node: KDTreeNode): Item {
        let minValueNode = node;
        while (minValueNode.left) {
            minValueNode = minValueNode.left;
        }
        return minValueNode.item;
    }

}
