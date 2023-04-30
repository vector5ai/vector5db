import { Collection } from '../Vector5Client';
import { Metric } from '../metrics/Metrics';
import { Item } from '../Item';

function generateRandomVector(length: number): number[] {
  return Array.from({ length }, () => Math.random());
}

function generateItems(count: number, vectorLength: number): Item[] {
  const items: Item[] = [];

  for (let i = 0; i < count; i++) {
    items.push({
      id: `item${i}`,
      vector: generateRandomVector(vectorLength),
      metadata: { exampleKey: `exampleValue${i}` },
      document: `This is a document example for item${i}`
    });
  }

  return items;
}

function testPerformance(itemCount: number, vectorLength: number, k: number, metric: Metric): void {
  const collection = new Collection('test_collection');
  const items = generateItems(itemCount, vectorLength);

  items.forEach((item) => {
    collection.add(item.id, item.vector, item.metadata, item.document);
  });

  const queryVector = generateRandomVector(vectorLength);

  const startTime = performance.now();
  collection.nearestNeighbors(queryVector, k, metric);
  const endTime = performance.now();

  console.log(`Time taken for ${itemCount} items with ${vectorLength}-dimensional vectors: ${(endTime - startTime).toFixed(2)} ms`);
}

describe('Collection Performance Tests', () => {
  const testCases = [
    { itemCount: 10000, vectorLength: 3, k: 5, metric: Metric.EUCLIDEAN },
    { itemCount: 100000, vectorLength: 3, k: 5, metric: Metric.EUCLIDEAN },
    { itemCount: 10000, vectorLength: 3, k: 5, metric: Metric.COSINE },
    { itemCount: 100000, vectorLength: 3, k: 5, metric: Metric.COSINE },
    { itemCount: 10000, vectorLength: 3, k: 5, metric: Metric.JACCARD },
    { itemCount: 100000, vectorLength: 3, k: 5, metric: Metric.JACCARD },

    { itemCount: 10000, vectorLength: 1536, k: 5, metric: Metric.EUCLIDEAN },
    { itemCount: 10000, vectorLength: 1536, k: 5, metric: Metric.COSINE },
    { itemCount: 10000, vectorLength: 1536, k: 5, metric: Metric.JACCARD },
  ];

  testCases.forEach((testCase) => {
    test.skip(`Performance test for ${testCase.itemCount} items with ${testCase.vectorLength}-dimensional vectors`, () => {
      testPerformance(testCase.itemCount, testCase.vectorLength, testCase.k, testCase.metric);
    });
  });
});
