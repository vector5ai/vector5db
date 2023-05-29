import { KDTree } from "../../src/lib/KDTree";
import Item from "../../src/Item";

const euclideanDistance = (a: number[], b: number[]): number => {
  return Math.sqrt(a.reduce((sum, value, index) => sum + Math.pow(value - b[index], 2), 0));
};

describe('KDTree', () => {
  const points: Item[] = [
    { id: 'item1', vector: [0, 1], metadata: {}, document: '' },
    { id: 'item2', vector: [1, 0], metadata: {}, document: '' },
    { id: 'item3', vector: [-1, 0], metadata: {}, document: '' },
    { id: 'item4', vector: [0, -1], metadata: {}, document: '' },
  ];

  const tree = new KDTree(points);

  test('nearestNeighbor', async () => {
    const queryPoint = [0.5, 0.5];
    const nearest = await tree.nearestNeighbor(queryPoint, euclideanDistance, undefined, 1);
    expect(nearest[0].vector).toEqual([1, 0]);
  });

  test('nearestNeighbor with maxDistance', async () => {
    const queryPoint = [0.5, 0.5];
    const maxDistance = 0.4;
    const nearest = await tree.nearestNeighbor(queryPoint, euclideanDistance, undefined, 1, maxDistance);
    expect(nearest.length).toEqual(0);
  });

  // Additional test cases
  test('nearestNeighbor with negative maxDistance', async () => {
    const queryPoint = [0.5, 0.5];
    const maxDistance = -1;
    const nearest = await tree.nearestNeighbor(queryPoint, euclideanDistance, undefined, 1, maxDistance);
    expect(nearest.length).toEqual(0);
  });

  test('nearestNeighbor with maxDistance equal to the exact distance', async () => {
    const queryPoint = [0.5, 0.5];
    const maxDistance = Math.sqrt(0.5);
    const nearest = await tree.nearestNeighbor(queryPoint, euclideanDistance, undefined, 1, maxDistance);
    expect(nearest[0].vector).toEqual([1, 0]);
  });

  test('nearestNeighbor with different queryPoint', async () => {
    const queryPoint = [-0.5, -0.5];
    const nearest = await tree.nearestNeighbor(queryPoint, euclideanDistance, undefined, 1);
    expect(nearest[0].vector).toEqual([-1, 0]);
  });

  test('nearestNeighbor with more dimensions', async () => {
    const points3D: Item[] = [
      { id: 'item1', vector: [0, 1, 0], metadata: {}, document: '' },
      { id: 'item2', vector: [1, 0, 0], metadata: {}, document: '' },
      { id: 'item3', vector: [-1, 0, 0], metadata: {}, document: '' },
      { id: 'item4', vector: [0, -1, 0], metadata: {}, document: '' },
      { id: 'item5', vector: [0, 0, 1], metadata: {}, document: '' },
      { id: 'item6', vector: [0, 0, -1], metadata: {}, document: '' },
    ];


    const tree3D = new KDTree(points3D);
    const queryPoint = [0.5, 0.5, 0.5];
    const nearest = await tree3D.nearestNeighbor(queryPoint, euclideanDistance, undefined, 1);
    expect(nearest[0].vector).toEqual([1, 0, 0]);
  });
});
