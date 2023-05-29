import Collection from '../src/Collection';
import Vector5db from '../src/Vector5db';
import { IndexType } from '../src/lib/Index';
import { Metric } from '../src/metrics/Metric';

describe('Collection query', () => {
  let client: Vector5db;
  let collection: Collection;

  const items = [
    { id: 'item1', vector: [1, 2, 3], metadata: { category: 'A' }, document: 'Sample 1' },
    { id: 'item2', vector: [4, 5, 6], metadata: { category: 'B' }, document: 'Sample 2' },
    { id: 'item3', vector: [7, 8, 9], metadata: { category: 'A' }, document: 'Sample 3' },
    { id: 'item4', vector: [0, 1, 2], metadata: { category: 'B' }, document: 'Sample 4' },
    { id: 'item5', vector: [3, 4, 5], metadata: { category: 'A' }, document: 'Sample 5' },
  ];

  beforeEach(() => {
    client = new Vector5db();
  });

  test('Euclidean distance', async () => {
    collection = client.createCollection('testCollection', Metric.EUCLIDEAN);

    items.forEach((item) => collection.add(item.id, item.vector, item.metadata, item.document));

    const query_embeddings = [[1, 2, 3], [7, 8, 9]];
    const results = collection.query(query_embeddings, 1);
    expect(results.length).toBe(2);
    expect(results[0][0].id).toBe('item1');
    expect(results[1][0].id).toBe('item3');
  });

  test('Cosine similarity', async () => {
    collection = client.createCollection('testCollection', Metric.COSINE);

    items.forEach((item) => collection.add(item.id, item.vector, item.metadata, item.document));

    const query_embeddings = [[1, 2, 3], [7, 8, 9]];
    const results = collection.query(query_embeddings, 1);
    expect(results.length).toBe(2);
    expect(results[0][0].id).toBe('item1');
    expect(results[1][0].id).toBe('item3');
  });

  test('Jaccard similarity', async () => {
    collection = client.createCollection('testCollection', Metric.JACCARD);

    items.forEach((item) => collection.add(item.id, item.vector, item.metadata, item.document));

    const query_embeddings = [[1, 2, 3], [7, 8, 9]];
    const results = collection.query(query_embeddings, 1);
    expect(results.length).toBe(2);
    expect(results[0][0].id).toBe('item1');
    expect(results[1][0].id).toBe('item3');
  });

  test('Filter by metadata', async () => {
    collection = client.createCollection('testCollection', Metric.EUCLIDEAN);

    items.forEach((item) => collection.add(item.id, item.vector, item.metadata, item.document));

    const query_embeddings = [[1, 2, 3]];
    const results = collection.query(query_embeddings, 1, { category: 'B' });
    expect(results.length).toBe(1);
    expect(results[0][0].id).toBe('item4');
  });

  test('Empty result', async () => {
    collection = client.createCollection('testCollection', Metric.EUCLIDEAN);

    items.forEach((item) => collection.add(item.id, item.vector, item.metadata, item.document));
    
    const query_embeddings = [[1, 2, 3]];
    const results = collection.query(query_embeddings, 1, { category: 'C' });
    expect(results.length).toBe(1);
    expect(results[0]).toEqual([]);
  });
});
