import { KDTree } from "../../src/lib/KDTree";

const euclideanDistance = (a: number[], b: number[]): number => {
  return Math.sqrt(a.reduce((sum, value, index) => sum + Math.pow(value - b[index], 2), 0));
};

describe('KDTree', () => {
  const points = [
    [0, 1],
    [1, 0],
    [-1, 0],
    [0, -1],
  ];

  const tree = new KDTree(points);

  test('nearestNeighbor', async () => {
    const queryPoint = [0.5, 0.5];
    const nearest = await tree.nearestNeighbor(queryPoint, euclideanDistance);
    expect(nearest).toEqual([1, 0]);
  });

  test('nearestNeighbor with maxDistance', async () => {
    const queryPoint = [0.5, 0.5];
    const maxDistance = 0.4;
    const nearest = await tree.nearestNeighbor(queryPoint, euclideanDistance, maxDistance);
    expect(nearest).toBeNull();
  });

  // Additional test cases
  test('nearestNeighbor with negative maxDistance', async () => {
    const queryPoint = [0.5, 0.5];
    const maxDistance = -1;
    const nearest = await tree.nearestNeighbor(queryPoint, euclideanDistance, maxDistance);
    expect(nearest).toBeNull();
  });

  test('nearestNeighbor with maxDistance equal to the exact distance', async () => {
    const queryPoint = [0.5, 0.5];
    const maxDistance = Math.sqrt(0.5);
    const nearest = await tree.nearestNeighbor(queryPoint, euclideanDistance, maxDistance);
    expect(nearest).toEqual([1, 0]);
  });

  test('nearestNeighbor with different queryPoint', async () => {
    const queryPoint = [-0.5, -0.5];
    const nearest = await tree.nearestNeighbor(queryPoint, euclideanDistance);
    expect(nearest).toEqual([-1, 0]);
  });

  test('nearestNeighbor with more dimensions', async () => {
    const points3D = [
      [0, 1, 0],
      [1, 0, 0],
      [-1, 0, 0],
      [0, -1, 0],
      [0, 0, 1],
      [0, 0, -1]
    ];
    const tree3D = new KDTree(points3D);
    const queryPoint = [0.5, 0.5, 0.5];
    const nearest = await tree3D.nearestNeighbor(queryPoint, euclideanDistance);
    expect(nearest).toEqual([1, 0, 0]);
  });
});
