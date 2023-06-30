export default class EuclideanDistance {
  static distance(a: number[], b: number[]): number {
    const squaredDifferences = a.map((value, index) => Math.pow(value - b[index], 2));
    return Math.sqrt(squaredDifferences.reduce((acc, value) => acc + value, 0));
  }

  static similarity(a: number[], b: number[]): number {
    return 1 / (1 + this.distance(a, b));
  }
}
