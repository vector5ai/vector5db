import { KDTree } from '../KDTree';
import { Item } from '../Item';

const euclideanDistance = (a: number[], b: number[]): number => {
    return Math.sqrt(a.reduce((acc, _, i) => acc + Math.pow(a[i] - b[i], 2), 0));
};

const items: Item[] = [
    { id: '1', vector: [1, 2], metadata: { category: 'A' }, document: 'doc1' },
    { id: '2', vector: [3, 4], metadata: { category: 'B' }, document: 'doc2' },
    { id: '3', vector: [5, 6], metadata: { category: 'A' }, document: 'doc3' },
    { id: '4', vector: [7, 8], metadata: { category: 'B' }, document: 'doc4' },
];

describe('KDTree', () => {
    let kdTree: KDTree;

    beforeEach(() => {
        kdTree = new KDTree(items, 2);
    });

    test('Constructor', () => {
        expect(kdTree).toBeDefined();
    });

    test('Nearest without metadata filter', () => {
        const nearest = kdTree.nearest([3, 3], 2, euclideanDistance);
        expect(nearest.length).toBe(2);
        expect(nearest.map((item) => item.id)).toEqual(['2', '1']);
    });

    test('Nearest with metadata filter', () => {
        const nearest = kdTree.nearest([3, 3], 2, euclideanDistance, { category: 'A' });
        expect(nearest.length).toBe(2);
        expect(nearest.map((item) => item.id)).toEqual(['1', '3']);
    });

    test('Add and search for a new item', () => {
        const newItem: Item = { id: '5', vector: [4, 4], metadata: { category: 'A' }, document: 'doc5' };
        kdTree.add(newItem);
        const nearest = kdTree.nearest([3, 3], 3, euclideanDistance);
        expect(nearest.length).toBe(3);
        expect(nearest.map((item) => item.id)).toEqual(['2', '5', '1']);
    });

    test('Remove an item and search again', () => {
        kdTree.remove(items[1]);
        const nearest = kdTree.nearest([3, 3], 2, euclideanDistance);
        expect(nearest.length).toBe(2);
        expect(nearest.map((item) => item.id)).toEqual(['1', '3']);
    });

    test('Remove non-existent item and search again', () => {
        const nonExistentItem: Item = { id: '6', vector: [6, 6], metadata: { category: 'A' }, document: 'doc6' };
        kdTree.remove(nonExistentItem);
        const nearest = kdTree.nearest([3, 3], 3, euclideanDistance);
        expect(nearest.length).toBe(3);
        expect(nearest.map((item) => item.id)).toEqual(['2', '1', '3']);
    });


    // Additional test data
    const items2: Item[] = [
        { id: '1', vector: [2, 3], metadata: { category: 'A' }, document: 'doc1' },
        { id: '2', vector: [5, 4], metadata: { category: 'B' }, document: 'doc2' },
        { id: '3', vector: [9, 6], metadata: { category: 'A' }, document: 'doc3' },
        { id: '4', vector: [4, 7], metadata: { category: 'A' }, document: 'doc4' },
        { id: '5', vector: [8, 1], metadata: { category: 'B' }, document: 'doc5' },
    ];

    // Test cases for full coverage
    test('Nearest with empty result', () => {
        kdTree = new KDTree(items2, 2);
        const nearest = kdTree.nearest([1, 1], 1, euclideanDistance, { category: 'C' });
        expect(nearest.length).toBe(0);
    });

    test('Remove non-existent item and search again', () => {
        kdTree = new KDTree(items2, 2);
        const nonExistentItem: Item = { id: '6', vector: [6, 6], metadata: { category: 'A' }, document: 'doc6' };
        kdTree.remove(nonExistentItem);
        const nearest = kdTree.nearest([3, 3], 3, euclideanDistance);
        expect(nearest.length).toBe(3);
        expect(nearest.map((item) => item.id)).toEqual(['1', '2', '4']);
    });

    test('Remove an item with two children and search again', () => {
        kdTree = new KDTree(items2, 2);
        const itemToRemove: Item = { id: '1', vector: [2, 3], metadata: { category: 'A' }, document: 'doc1' };
        kdTree.remove(itemToRemove);
        const nearest = kdTree.nearest([3, 3], 3, euclideanDistance);
        expect(nearest.length).toBe(3);
        expect(nearest.map((item) => item.id)).toEqual(['2', '4', '5']);
    });

    test('Remove root node and search again', () => {
        kdTree = new KDTree(items2, 2);
    
        const rootItem: Item = { id: '1', vector: [2, 3], metadata: { category: 'A' }, document: 'doc1' };
        kdTree.remove(rootItem);
        const nearest = kdTree.nearest([3, 3], 2, euclideanDistance);
        expect(nearest.length).toBe(2);
        expect(nearest.map((item) => item.id)).toEqual(['2', '4']);
    });
});
