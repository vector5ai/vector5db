import Vector5db from '../src/Vector5db';

describe('Vector5Client', () => {
    let client: Vector5db;

    beforeEach(() => {
        client = new Vector5db();
    });

    test('listCollections', () => {
        client.createCollection('test1');
        client.createCollection('test2');
        expect(client.listCollections()).toEqual(['test1', 'test2']);
    });

    test('createCollection', () => {
        const collection = client.createCollection('testname');
        expect(client.listCollections()).toContain('testname');
        expect(collection).toBeDefined();
    });

    test('getCollection', () => {
        client.createCollection('testname');
        const collection = client.getCollection('testname');
        expect(collection).toBeDefined();
    });

    test('getOrCreateCollection', () => {
        const collection1 = client.getOrCreateCollection('testname');
        expect(client.listCollections()).toContain('testname');
        expect(collection1).toBeDefined();

        const collection2 = client.getOrCreateCollection('testname');
        expect(collection1).toBe(collection2);
    });

    test('deleteCollection', () => {
        client.createCollection('testname');
        client.deleteCollection('testname');
        expect(client.listCollections()).not.toContain('testname');
    });

    test('reset', () => {
        client.createCollection('test1');
        client.createCollection('test2');
        client.reset();
        expect(client.listCollections()).toEqual([]);
    });
});


describe('Collection', () => {
    let client: Vector5db;
    let collection: ReturnType<typeof client.createCollection>;

    beforeEach(() => {
        client = new Vector5db();
        collection = client.createCollection('testCollection');
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

    test('delete', () => {
        collection.add('item1', [1.5, 2.9, 3.4], { example: 'value' }, 'Sample document');
        collection.delete('item1');
        expect(collection.get('item1')).toBeNull();
    });
});