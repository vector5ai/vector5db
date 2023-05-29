import { performance } from 'perf_hooks';
import { KDTree } from '../../src/lib/KDTree';
import { kdTree } from 'kd-tree-javascript';
import ProgressBar from 'progress';
import v8 from 'v8';

interface Point2D {
  0: number;
  1: number;
}

interface Point1536D {
  coords: number[];
}

interface Point2D {
  0: number;
  1: number;
}

interface Point1536D {
  coords: number[];
}

const euclideanDistanceMyImpl = (a: number[], b: number[]): number => {
  return Math.sqrt(a.reduce((sum, value, index) => sum + Math.pow(value - b[index], 2), 0));
};

const euclideanDistance2D = (a: Point2D, b: Point2D): number => {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
};

const euclideanDistance1536D = (a: Point1536D, b: Point1536D): number => {
  return Math.sqrt(
    a.coords.reduce((sum, value, index) => sum + Math.pow(value - b.coords[index], 2), 0)
  );
};

// Perform 2D points test
console.log('Starting 2D points test...');

const benchmarkResults = [];

// Test with 2D points
const numPoints2D = 100000;
const points2D: Point2D[] = Array.from({ length: numPoints2D }, () => ({
  0: Math.random() * 100,
  1: Math.random() * 100,
}));

const numQueries2D = 100000;
const queryPoints2D: Point2D[] = Array.from({ length: numQueries2D }, () => ({
  0: Math.random() * 100,
  1: Math.random() * 100,
}));

const barMyImpl2D = new ProgressBar('My Impl 2D points [:bar] :percent :etas', { total: numQueries2D });
const barKDTreeJS2D = new ProgressBar('KDTreeJS 2D points [:bar] :percent :etas', { total: numQueries2D });

let initialMemory = v8.getHeapStatistics();//process.memoryUsage().heapUsed;
const myKDTree2D = new KDTree(points2D.map(point => [point[0], point[1]]));
const myKDTree2DStartTime = performance.now();
const myImplResults = queryPoints2D.map((queryPoint, index, array) => {
  myKDTree2D.nearestNeighbor([queryPoint[0], queryPoint[1]], euclideanDistanceMyImpl);
  barMyImpl2D.tick();
});
const myKDTree2DEndTime = performance.now();
let finalMemory = v8.getHeapStatistics();//process.memoryUsage().heapUsed;
console.log(`My KDTree implementation took ${myKDTree2DEndTime - myKDTree2DStartTime} ms.`);
console.log(`Memory used: ${finalMemory.used_heap_size - initialMemory.used_heap_size} bytes`);

initialMemory = v8.getHeapStatistics();//process.memoryUsage().heapUsed;
const kdTreeJavaScript2D = new kdTree<Point2D>(points2D, euclideanDistance2D, [0, 1]);
const kdTreeJavaScript2DStartTime = performance.now();
const javascriptImplResults = queryPoints2D.map((queryPoint, index, array) => {
  kdTreeJavaScript2D.nearest(queryPoint, 1);
  barKDTreeJS2D.tick(); 
});
const kdTreeJavaScript2DEndTime = performance.now();
finalMemory = v8.getHeapStatistics();//process.memoryUsage().heapUsed;
console.log(`kd-tree-javascript implementation took ${kdTreeJavaScript2DEndTime - kdTreeJavaScript2DStartTime} ms.`);
console.log(`Memory used: ${finalMemory.used_heap_size - initialMemory.used_heap_size} bytes`);

benchmarkResults.push({
  Dimensions: 2,
  'My KDTree (ms)': myKDTree2DEndTime - myKDTree2DStartTime,
  'kd-tree-javascript (ms)': kdTreeJavaScript2DEndTime - kdTreeJavaScript2DStartTime,
});

// Compare the results
const sameResults = myImplResults.every((result, index) => {
  return JSON.stringify(result) === JSON.stringify(javascriptImplResults[index]);
});
console.log(`Both implementations returned the same results: ${sameResults}`);


console.log(`-----------------------------------------------------------------------------------------------------------------------------------`);

// Perform 1536D points test
console.log('Starting 1536D points test...');

// Test with 1536D points
// const numPoints1536D = 100000;
const numPoints1536D = 2000;
const points1536D: Point1536D[] = Array.from({ length: numPoints1536D }, () => ({
  coords: Array.from({ length: 1536 }, () => Math.random() * 2 - 1),
}));

const numQueries1536D = 10000;
const queryPoints1536D: Point1536D[] = Array.from({ length: numQueries1536D }, () => ({
  coords: Array.from({ length: 1536 }, () => Math.random() * 2 - 1),
}));

const barMyImpl1536D = new ProgressBar('My Impl 1536D points [:bar] :percent :etas', { total: numQueries1536D });
const barKDTreeJS1536D = new ProgressBar('KDTreeJS 1536D points [:bar] :percent :etas', { total: numQueries1536D });

initialMemory = v8.getHeapStatistics();//process.memoryUsage().heapUsed;
const myKDTree1536D = new KDTree(points1536D.map(point => point.coords));
const myKDTree1536DStartTime = performance.now();
queryPoints1536D.forEach(queryPoint => myKDTree1536D.nearestNeighbor(queryPoint.coords, euclideanDistanceMyImpl));
const myImplResults1536D = queryPoints1536D.map((queryPoint, index, array) => {
  myKDTree1536D.nearestNeighbor(queryPoint.coords, euclideanDistanceMyImpl);
  barMyImpl1536D.tick();
});
const myKDTree1536DEndTime = performance.now();
finalMemory = v8.getHeapStatistics();//process.memoryUsage().heapUsed;
console.log(`My KDTree implementation took ${myKDTree1536DEndTime - myKDTree1536DStartTime} ms.`);
console.log(`Memory used: ${finalMemory.used_heap_size - initialMemory.used_heap_size} bytes`);

initialMemory = v8.getHeapStatistics();//process.memoryUsage().heapUsed;
const kdTreeJavaScript1536D = new kdTree<Point1536D>(points1536D, euclideanDistance1536D, ['coords']);
const kdTreeJavaScript1536DStartTime = performance.now();
const javascriptImplResults1536D = queryPoints1536D.map((queryPoint, index, array) => {
  kdTreeJavaScript1536D.nearest(queryPoint, 1);
  barKDTreeJS1536D.tick();
});
const kdTreeJavaScript1536DEndTime = performance.now();
finalMemory = v8.getHeapStatistics();//process.memoryUsage().heapUsed;
console.log(`kd-tree-javascript implementation took ${kdTreeJavaScript1536DEndTime - kdTreeJavaScript1536DStartTime} ms.`);
console.log(`Memory used: ${finalMemory.used_heap_size - initialMemory.used_heap_size} bytes`);

benchmarkResults.push({
  Dimensions: 1536,
  'My KDTree (ms)': myKDTree1536DEndTime - myKDTree1536DStartTime,
  'kd-tree-javascript (ms)': kdTreeJavaScript1536DEndTime - kdTreeJavaScript1536DStartTime,
});

// Compare the results
const sameResults1536D = myImplResults.every((result, index) => {
  return JSON.stringify(result) === JSON.stringify(javascriptImplResults[index]);
});
console.log(`Both implementations returned the same results: ${sameResults1536D}`);

// Print the results
console.table(benchmarkResults);