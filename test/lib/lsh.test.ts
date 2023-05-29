import { LSH2 } from "../../src/lib/lsh/LSH2";
import Item from "../../src/Item";
import CosineSimiliarity from "../../src/metrics/CosineSimilarity";

describe('LSH', () => {
  let lsh: LSH2;
  const dimensions = 100;

  beforeEach(() => {
    lsh = new LSH2(dimensions);
  });

  // Helper function to generate a random vector
  function generateVector(dimensions: number): number[] {
    return Array.from({ length: dimensions }, () => Math.random());
  }

  test('should insert vectors correctly', () => {
    const vector = generateVector(dimensions);
    const id = 'vector1';

    lsh.addPoint(vector, id);

    expect(vector).toEqual(lsh.getPointById(id));
  });

  test('should find similar vectors', () => {
    const vector1 = generateVector(dimensions);
    const id1 = 'vector1';
    lsh.addPoint(vector1, id1);

    const vector2 = vector1.map(val => val + Math.random() * 0.01); // Slightly perturb vector1 to create a similar vector
    const id2 = 'vector2';

    const similarItems = lsh.query(vector2, CosineSimiliarity.distance);

    // Check that the similar item is found and its similarity is above a threshold
    const similarItem = similarItems.find(item => item === id2);
    expect(similarItem).toBeDefined();
    expect(CosineSimiliarity.distance(vector1, vector2)).toBeGreaterThan(0.9); // Adjust this threshold as needed
  });

  test('should not find dissimilar vectors', () => {
    const vector1 = generateVector(dimensions);
    const id1 = 'vector1';
    lsh.addPoint(vector1, id1);

    const vector2 = generateVector(dimensions); // Generate a completely new random vector
    const id2 = 'vector2';
    lsh.addPoint(vector2, id2);

    const similarItems = lsh.query(vector1, CosineSimiliarity.distance);

    // Check that the dissimilar item is not found, or its similarity is below a threshold
    const dissimilarItem = similarItems.find(item => item === id2);
    expect(dissimilarItem).toBeUndefined();
  });

  test('should handle a large number of vectors', () => {
    const numVectors = 1000;
    const vectors = new Map();
  
    for (let i = 0; i < numVectors; i++) {
      const vector = generateVector(dimensions);
      vectors.set(`vector${i}`, vector);
      lsh.addPoint(vector, `vector${i}`);

    }
  
    const queryVector = generateVector(dimensions);
    const similarItems = lsh.query(queryVector, CosineSimiliarity.distance);
  
    // Check that the number of similar items is reasonable.
    // This will depend on your LSH implementation and the similarity threshold you're using.
    // Here we're assuming that at least 1% of the vectors should be considered similar.
    expect(similarItems.length).toBeGreaterThan(numVectors * 0.01);
  
    // Check that all returned items have a similarity above a certain threshold.
    // This threshold will depend on your LSH implementation and your specific use case.
    // Here we're assuming a threshold of 0.8.
    for (const item of similarItems) {
      expect(CosineSimiliarity.distance(queryVector, vectors.get(item))).toBeLessThan(0.2);
    }
  
    // Check that the similar items are sorted by similarity, in descending order.
    for (let i = 0; i < similarItems.length - 1; i++) {
      expect(CosineSimiliarity.distance(queryVector, vectors.get(similarItems[i]))).toBeGreaterThanOrEqual(CosineSimiliarity.distance(queryVector, vectors.get(similarItems[i+1])));
    }
  });  
});
