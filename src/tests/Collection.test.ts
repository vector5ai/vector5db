import { Vector5Client } from '../Vector5Client';
import { Metric } from '../metrics/Metrics';

describe('Collection query', () => {
  let client: Vector5Client;
  let collection: ReturnType<typeof client.create_collection>;

  beforeEach(() => {
    client = new Vector5Client();
    collection = client.create_collection('testCollection');

    const items = [
      { id: 'item1', vector: [1, 2, 3], metadata: { category: 'A' }, document: 'Sample 1' },
      { id: 'item2', vector: [4, 5, 6], metadata: { category: 'B' }, document: 'Sample 2' },
      { id: 'item3', vector: [7, 8, 9], metadata: { category: 'A' }, document: 'Sample 3' },
      { id: 'item4', vector: [0, 1, 2], metadata: { category: 'B' }, document: 'Sample 4' },
      { id: 'item5', vector: [3, 4, 5], metadata: { category: 'A' }, document: 'Sample 5' },
    ];

    items.forEach((item) => collection.add(item.id, item.vector, item.metadata, item.document));
  });

  test('Euclidean distance', () => {
    const query_embeddings = [[1, 2, 3], [7, 8, 9]];
    const results = collection.query(query_embeddings, 1, Metric.EUCLIDEAN);
    expect(results.length).toBe(2);
    expect(results[0][0].id).toBe('item1');
    expect(results[1][0].id).toBe('item3');
  });

  test('Cosine similarity', () => {
    const query_embeddings = [[1, 2, 3], [7, 8, 9]];
    const results = collection.query(query_embeddings, 1, Metric.COSINE);
    expect(results.length).toBe(2);
    expect(results[0][0].id).toBe('item1');
    expect(results[1][0].id).toBe('item3');
  });

  test('Jaccard similarity', () => {
    const query_embeddings = [[1, 2, 3], [7, 8, 9]];
    const results = collection.query(query_embeddings, 1, Metric.JACCARD);
    expect(results.length).toBe(2);
    expect(results[0][0].id).toBe('item1');
    expect(results[1][0].id).toBe('item3');
  });

  test('Filter by metadata', () => {
    const query_embeddings = [[1, 2, 3]];
    const results = collection.query(query_embeddings, 1, Metric.EUCLIDEAN, { category: 'B' });
    expect(results.length).toBe(1);
    expect(results[0][0].id).toBe('item4');
  });

  test('Empty result', () => {
    const query_embeddings = [[1, 2, 3]];
    const results = collection.query(query_embeddings, 1, Metric.EUCLIDEAN, { category: 'C' });
    expect(results.length).toBe(1);
    expect(results[0]).toEqual([]);
  });
});
