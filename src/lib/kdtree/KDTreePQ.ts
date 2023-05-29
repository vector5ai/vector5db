class KDNode {
    public vector: number[];
    public left: KDNode | null;
    public right: KDNode | null;
    public originalVectors: number[][];

    constructor(vector: number[], originalVectors: number[][]) {
        this.vector = vector;
        this.left = null;
        this.right = null;
        this.originalVectors = originalVectors;
    }
}


export class KDTreePQ {
    private root: KDNode | null;
    private centroids: number[][];
    private subvectors: number[][];
    private originalVectors: number[][][];
    private numSubvectors: number;
    private numCentroids: number;
    private distanceFunction: (a: number[], b: number[]) => number;

    constructor(vectors: number[][], numSubvectors: number, numCentroids: number, distanceFunction: (a: number[], b: number[]) => number) {
        this.numSubvectors = numSubvectors;
        this.numCentroids = numCentroids;
        this.distanceFunction = distanceFunction;

        const { centroids, subvectors, originalVectors } = this.quantizeVectors(vectors);
        this.centroids = centroids;
        this.subvectors = subvectors;

        this.root = this.buildTree(subvectors, originalVectors, 0);
    }

    private quantizeVectors(vectors: number[][]): { centroids: number[][], subvectors: number[][], originalVectors: number[][][] } {
        const subvectors: number[][] = [];
        const subvectorSize: number = vectors[0].length / this.numSubvectors;
        const centroids: number[][] = [];
        const originalVectors: number[][][] = [];

        for (let i = 0; i < this.numSubvectors; i++) {
            const vectorsForSubvector: number[][] = vectors.map((vector: number[]) => vector.slice(i * subvectorSize, (i + 1) * subvectorSize));
            const subvectorCentroids: number[][] = kMeans(vectorsForSubvector, this.numCentroids, this.distanceFunction);
            centroids.push(...subvectorCentroids);

            const originalVectorsForSubvector: number[][][] = Array(this.numCentroids).fill(null).map(() => []);

            subvectors.push(...vectorsForSubvector.map((subvector: number[]) => {
                const closestCentroidIndex: number = subvectorCentroids.reduce((closestIndex: number, centroid: number[], index: number) =>
                    this.distanceFunction(subvector, centroid) < this.distanceFunction(subvector, subvectorCentroids[closestIndex]) ?
                        index : closestIndex,
                    0
                );
                originalVectorsForSubvector[closestCentroidIndex].push(vectors[i]);
                return subvectorCentroids[closestCentroidIndex];
            }));

            originalVectors.push(...originalVectorsForSubvector);
        }

        return { centroids, subvectors, originalVectors };
    }

    private buildTree(vectors: number[][], originalVectors: number[][][], depth: number): KDNode | null {
        if (vectors.length === 0) {
            return null;
        }

        const axis: number = depth % vectors[0].length;

        vectors.sort((a: number[], b: number[]) => a[axis] - b[axis]);

        const medianIndex: number = Math.floor(vectors.length / 2);
        const medianVector: number[] = vectors[medianIndex];
        const medianOriginalVectors: number[][] = originalVectors[medianIndex];

        const node: KDNode = new KDNode(medianVector, medianOriginalVectors);
        node.left = this.buildTree(vectors.slice(0, medianIndex), originalVectors.slice(0, medianIndex), depth + 1);
        node.right = this.buildTree(vectors.slice(medianIndex + 1), originalVectors.slice(medianIndex + 1), depth + 1);

        return node;
    }

    public nearestNeighbor(query: number[]): KDNode | null {
        const quantizedQuery: number[] = this.quantizeVector(query);

        let bestNode: KDNode | null = null;
        let bestDistance: number = Infinity;

        if (!this.root) {
            return null;
        }

        const priorityQueue: [KDNode, number][] = [[this.root, 0]];

        while (priorityQueue.length > 0) {
            priorityQueue.sort((a, b) => a[1] - b[1]);  // Sort by priority (distance to splitting plane)

            const next = priorityQueue.shift();  // Dequeue the node with the highest priority

            if (!next) {
                continue;
            }

            const [node, depth] = next;

            const distance: number = this.distanceFunction(node.vector, quantizedQuery);

            if (distance < bestDistance) {
                bestNode = node;
                bestDistance = distance;
            }

            const axis: number = depth % (quantizedQuery.length / this.numSubvectors);

            if (quantizedQuery[axis] < node.vector[axis]) {
                if (node.left !== null) {
                    priorityQueue.push([node.left, depth + 1]);
                }
                if (node.right !== null && quantizedQuery[axis] + bestDistance >= node.vector[axis]) {
                    priorityQueue.push([node.right, depth + 1]);
                }
            } else {
                if (node.right !== null) {
                    priorityQueue.push([node.right, depth + 1]);
                }
                if (node.left !== null && quantizedQuery[axis] - bestDistance <= node.vector[axis]) {
                    priorityQueue.push([node.left, depth + 1]);
                }
            }
        }

        return bestNode;
    }

    private quantizeVector(vector: number[]): number[] {
        const subvectorSize: number = vector.length / this.numSubvectors;
        return Array(this.numSubvectors).fill(null).flatMap((_, i: number) => {
            const subvector: number[] = vector.slice(i * subvectorSize, (i + 1) * subvectorSize);
            const closestCentroid: number[] = this.centroids.reduce((closest: number[], centroid: number[]) => this.distanceFunction(subvector, centroid) < this.distanceFunction(subvector, closest) ? centroid : closest,
                this.centroids[0]);
            return closestCentroid;
        });
    }

    public queryOriginalVectors(query: number[]): number[][] | null {
        const nearestNode: KDNode | null = this.nearestNeighbor(query);
    
        if (nearestNode === null) {
            return null;
        }
    
        return nearestNode.originalVectors;
    }
}

function kMeans(data: number[][], k: number, distanceFunction: (a: number[], b: number[]) => number, maxIterations = 100): number[][] {
    // Step 1: Initialize centroids randomly
    let centroids: number[][] = [];
    for (let i = 0; i < k; i++) {
        const index = Math.floor(Math.random() * data.length);
        centroids.push(data[index]);
    }

    // Step 2: Assign points to nearest centroid
    let clusters: number[][][] = [];
    for (let i = 0; i < k; i++) {
        clusters.push([]);
    }

    let iterations = 0;
    let moved = true;
    while (iterations < maxIterations && moved) {
        moved = false;

        // Reset clusters
        for (let i = 0; i < k; i++) {
            clusters[i] = [];
        }

        // Assign points to nearest centroid
        for (const point of data) {
            let closestCentroid = centroids[0];
            let closestDistance = Infinity;

            for (const centroid of centroids) {
                const distance = distanceFunction(point, centroid);

                if (distance < closestDistance) {
                    closestCentroid = centroid;
                    closestDistance = distance;
                }
            }

            const clusterIndex = centroids.indexOf(closestCentroid);
            clusters[clusterIndex].push(point);
        }

        // Update centroids
        for (let i = 0; i < k; i++) {
            const oldCentroid = centroids[i];
            const newCentroid = calculateCentroid(clusters[i]);

            if (!arraysEqual(oldCentroid, newCentroid)) {
                centroids[i] = newCentroid;
                moved = true;
            }
        }

        iterations++;
    }

    return centroids;
}

function calculateCentroid(points: number[][]): number[] {
    const numPoints = points.length;
    const numDimensions = points[0].length;
    const centroid: number[] = Array(numDimensions).fill(0);

    for (const point of points) {
        for (let i = 0; i < numDimensions; i++) {
            centroid[i] += point[i];
        }
    }

    for (let i = 0; i < numDimensions; i++) {
        centroid[i] /= numPoints;
    }

    return centroid;
}

function arraysEqual(a: any[], b: any[]): boolean {
    if (a.length !== b.length) {
        return false;
    }

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}