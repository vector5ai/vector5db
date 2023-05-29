# Vector5db Client-side Vector Database

A lightweight and efficient client-side vector database implementation in TypeScript. This library is designed for web applications, providing features such as inserting, querying, and deleting vectors while supporting operations like distance calculations and nearest neighbor search.

## Features

- Lightweight and efficient vector database
- Runs entirely in the browser, on the client side
- Insert, query, and delete vectors
- Supports distance calculations (e.g., Euclidean distance)
- Nearest neighbor search with optional metadata filtering
- Written in TypeScript

## Installation

```bash
npm install --save vector5ai/vector5db
```

## Vecto5db operations

```javascript
// Initialize Vector5db
const db = new Vector5db();

// Sample data
const items: Item[] = [
  { id: '1', vector: [1, 2], metadata: { category: 'A' } },
  { id: '2', vector: [3, 4], metadata: { category: 'B' } },
  // ...
];

// Create a new collection
// Index types parameter is optional, only BRUTE_FORCE is supported in v0.1.0 release
const collectionName = 'exampleCollection';
const collection = db.createCollection(collectionName, Metric.EUCLIDEAN, [IndexType.BRUTE_FORCE]);

// Insert items into the collection
items.forEach((item) => collection.add(item.id, item.vector, item.metadata, item.document));

// Retrieve a collection
const retrievedCollection = db.getCollection(collectionName);

// Query the nearest item
const query = [2, 3];
const nearest = retrievedCollection.query(query, 1);

// Query items with metadata filtering
const filteredResults = retrievedCollection.query(query, 2, { category: 'A' });

// Delete a collection
db.deleteCollection(collectionName);

// Reset Vector5db (deletes all collections)
db.reset();
```

## Collection operations

```javascript

// count(): number
//
// Get length of collection entries
collection.count();

// add(
//     id: string,
//     vector: number[],
//     metadata: Record<string, any>,
//     document: string
// ): void
//
// Add items into the collection
collection.add('item1', [1, 2, 3, 4, -5], { category: 'A' });

// get(id: string): Item | null
//
// Retrieve item from collection
collection.get('item1');

// peek(n: number = 5): Item[]
//
// Retrieve n-number of items from collection
collection.peek(5);

// query(
//     query_embeddings: number[][],
//     n_results: number = 1,
//     where?: MetadataType | undefined,
//     indexType: IndexType = IndexType.BRUTE_FORCE
// ): Item[][]
//
// Query the nearest item
collection.query([0, 0, 1, 1, 2], 1);
// Query items with metadata filtering
collection.query([0, 0, 1, 1, 2], 1, { category: 'C', page: 1 });


// delete(id: string): void 
//
// Remove item from collection
collection.delete('item1');


// reset(): void 
//
// Clear collection
collection.reset();

// distance(a: number[], b: number[], metric: Metric = Metric.EUCLIDEAN): number 
// 
// Get distance between two vectors using selected metric
collection.distance([1, 2], [1, 3], Metric.EUCLIDEAN);