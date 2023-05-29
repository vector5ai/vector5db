## Test data
{ itemCount: 10000, vectorLength: 3, k: 5, metric: Metric.EUCLIDEAN },
{ itemCount: 100000, vectorLength: 3, k: 5, metric: Metric.EUCLIDEAN },
{ itemCount: 10000, vectorLength: 3, k: 5, metric: Metric.COSINE },
{ itemCount: 100000, vectorLength: 3, k: 5, metric: Metric.COSINE },
{ itemCount: 10000, vectorLength: 3, k: 5, metric: Metric.JACCARD },
{ itemCount: 100000, vectorLength: 3, k: 5, metric: Metric.JACCARD },

{ itemCount: 10000, vectorLength: 1536, k: 5, metric: Metric.EUCLIDEAN },
{ itemCount: 10000, vectorLength: 1536, k: 5, metric: Metric.COSINE },
{ itemCount: 10000, vectorLength: 1536, k: 5, metric: Metric.JACCARD },

## Performance tests without optimization

* Time taken for 10000 items with 3-dimensional vectors: 63.18 ms
* Time taken for 100000 items with 3-dimensional vectors: 341.06 ms
* Time taken for 10000 items with 3-dimensional vectors: 36.21 ms
* Time taken for 100000 items with 3-dimensional vectors: 541.08 ms
* Time taken for 10000 items with 3-dimensional vectors: 37.60 ms
* Time taken for 100000 items with 3-dimensional vectors: 386.51 ms
* Time taken for 10000 items with 1536-dimensional vectors: 4448.64 ms
* Time taken for 10000 items with 1536-dimensional vectors: 7765.68 ms
* Time taken for 10000 items with 1536-dimensional vectors: 4687.83 ms


## Performance tests with kdtree
* Time taken for 10000 items with 3-dimensional vectors: 38.33 ms
* Time taken for 100000 items with 3-dimensional vectors: 604.91 ms
* Time taken for 10000 items with 3-dimensional vectors: 27.98 ms
* Time taken for 100000 items with 3-dimensional vectors: 687.96 ms
* Time taken for 10000 items with 3-dimensional vectors: 35.37 ms
* Time taken for 100000 items with 3-dimensional vectors: 600.47 ms
* Time taken for 10000 items with 1536-dimensional vectors: 60.17 ms
* Time taken for 10000 items with 1536-dimensional vectors: 63.50 ms
* Time taken for 10000 items with 1536-dimensional vectors: 58.98 ms


## Extra test with KDTree
{ itemCount: 20000, vectorLength: 1536, k: 5, metric: Metric.EUCLIDEAN },
{ itemCount: 20000, vectorLength: 1536, k: 5, metric: Metric.COSINE },
{ itemCount: 20000, vectorLength: 1536, k: 5, metric: Metric.JACCARD },

* Time taken for 100000 items with 1536-dimensional vectors: 1654.35 ms
* Time taken for 100000 items with 1536-dimensional vectors: 1721.24 ms
* Time taken for 100000 items with 1536-dimensional vectors: 2032.73 ms