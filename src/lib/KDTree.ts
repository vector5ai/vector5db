export class KDNode {
    point: number[];
    left: KDNode | null;
    right: KDNode | null;

    constructor(point: number[]) {
        this.point = point;
        this.left = null;
        this.right = null;
    }
}

export class KDTree {
    root: KDNode | null;

    constructor(points: number[][]) {
        this.root = this.buildTree(points, 0);
    }

    private buildTree(points: number[][], depth: number): KDNode | null {
        if (points.length === 0) {
            return null;
        }

        const k = points.length;
        const axis = depth % k;
        points.sort((a, b) => a[axis] - b[axis]);

        const median = Math.floor(points.length / 2);
        const node = new KDNode(points[median]);

        node.left = this.buildTree(points.slice(0, median), depth + 1);
        node.right = this.buildTree(points.slice(median + 1), depth + 1);

        return node;
    }

    async nearestNeighbor(queryPoint: number[], distanceFunction: (a: number[], b: number[]) => number, maxDistance?: number): Promise<number[] | null> {
        return this.searchNearest(this.root, queryPoint, distanceFunction, 0, maxDistance);
    }

    private async searchNearest(node: KDNode | null, queryPoint: number[], distanceFunction: (a: number[], b: number[]) => number, depth: number, maxDistance?: number): Promise<number[] | null> {
        if (!node) {
            return null;
        }

        const k = queryPoint.length;
        const axis = depth % k;
        const nextBranch = queryPoint[axis] < node.point[axis] ? node.left : node.right;
        const oppositeBranch = nextBranch === node.left ? node.right : node.left;

        let best = await this.searchNearest(nextBranch, queryPoint, distanceFunction, depth + 1, maxDistance);
        let bestDistance = best ? distanceFunction(queryPoint, best) : Infinity;

        if (maxDistance === undefined || bestDistance > maxDistance) {
            const currentDistance = distanceFunction(queryPoint, node.point);
            if (currentDistance < bestDistance) {
                bestDistance = currentDistance;
                best = node.point;
            }

            if (Math.abs(queryPoint[axis] - node.point[axis]) < bestDistance) {
                const oppositeBest = await this.searchNearest(oppositeBranch, queryPoint, distanceFunction, depth + 1, maxDistance);
                const oppositeBestDistance = oppositeBest ? distanceFunction(queryPoint, oppositeBest) : Infinity;

                if (oppositeBestDistance < bestDistance) {
                    bestDistance = oppositeBestDistance;
                    best = oppositeBest;
                }
            }
        }

        if (maxDistance !== undefined && bestDistance > maxDistance) {
            return null;
        }

        return best;
    }
}