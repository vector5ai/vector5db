import { Vector5Client } from '../Vector5Client';

describe('Vector5Client', () => {
    let client: Vector5Client;

    beforeEach(() => {
        client = new Vector5Client();
    });

    test('list_collections', () => {
        client.create_collection('test1');
        client.create_collection('test2');
        expect(client.list_collections()).toEqual(['test1', 'test2']);
    });

    test('create_collection', () => {
        const collection = client.create_collection('testname');
        expect(client.list_collections()).toContain('testname');
        expect(collection).toBeDefined();
    });

    test('get_collection', () => {
        client.create_collection('testname');
        const collection = client.get_collection('testname');
        expect(collection).toBeDefined();
    });

    test('get_or_create_collection', () => {
        const collection1 = client.get_or_create_collection('testname');
        expect(client.list_collections()).toContain('testname');
        expect(collection1).toBeDefined();

        const collection2 = client.get_or_create_collection('testname');
        expect(collection1).toBe(collection2);
    });

    test('delete_collection', () => {
        client.create_collection('testname');
        client.delete_collection('testname');
        expect(client.list_collections()).not.toContain('testname');
    });

    test('reset', () => {
        client.create_collection('test1');
        client.create_collection('test2');
        client.reset();
        expect(client.list_collections()).toEqual([]);
    });
});


describe('Collection', () => {
    let client: Vector5Client;
    let collection: ReturnType<typeof client.create_collection>;

    beforeEach(() => {
        client = new Vector5Client();
        collection = client.create_collection('testCollection');
    });

    test('count', () => {
        collection.add('item1', [1.5, 2.9, 3.4], { example: 'value' }, 'Sample document');
        expect(collection.count()).toBe(1);
    });

    test('add and get', () => {
        const id = 'item1';
        const vector = [1.5, 2.9, 3.4];
        const metadata = { example: 'value' };
        const document = 'Sample document';
        collection.add(id, vector, metadata, document);

        const item = collection.get(id);
        expect(item).toEqual({ id, vector, metadata, document });
    });

    test('peek', () => {
        const items = [
            { id: 'item1', vector: [1, 2, 3], metadata: { example: 'value1' }, document: 'Sample 1' },
            { id: 'item2', vector: [4, 5, 6], metadata: { example: 'value2' }, document: 'Sample 2' },
            { id: 'item3', vector: [7, 8, 9], metadata: { example: 'value3' }, document: 'Sample 3' },
            { id: 'item4', vector: [0, 1, 2], metadata: { example: 'value4' }, document: 'Sample 4' },
            { id: 'item5', vector: [3, 4, 5], metadata: { example: 'value5' }, document: 'Sample 5' },
        ];
        items.forEach((item) => collection.add(item.id, item.vector, item.metadata, item.document));

        expect(collection.peek()).toEqual(items.slice(0, 5));
    });

    test('query', () => {
        // Add test for the query method here
    });

    test('delete', () => {
        collection.add('item1', [1.5, 2.9, 3.4], { example: 'value' }, 'Sample document');
        collection.delete('item1');
        expect(collection.get('item1')).toBeNull();
    });

    // As the query method requires additional logic and calculation, it is not covered in this example.
    // You can create a separate function for distance calculation (e.g., Euclidean or cosine similarity)
    // and then use it in the query method to return the desired results.
    test('query', () => {
        // Add test for the query method here
    });
});