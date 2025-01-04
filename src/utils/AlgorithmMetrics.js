class AlgorithmMetrics {
    constructor() {
      this.metrics = new Map();
      this.currentRun = null;
    }
  
    startRun(algorithmName) {
      this.currentRun = {
        algorithm: algorithmName,
        startTime: performance.now(),
        nodesVisited: 0,
        pathLength: 0,
        memory: performance.memory?.usedJSHeapSize || 0
      };
    }
  
    endRun() {
      if (!this.currentRun) return;
      
      this.currentRun.endTime = performance.now();
      this.currentRun.duration = this.currentRun.endTime - this.currentRun.startTime;
      
      this.metrics.set(this.currentRun.algorithm, {
        ...this.currentRun,
        timestamp: Date.now()
      });
      
      this.currentRun = null;
    }
  
    recordNodeVisit() {
      if (this.currentRun) {
        this.currentRun.nodesVisited++;
      }
    }
  
    setPathLength(length) {
      if (this.currentRun) {
        this.currentRun.pathLength = length;
      }
    }
  
    getMetrics(algorithm) {
      return this.metrics.get(algorithm);
    }
  
    getComparison() {
      return Array.from(this.metrics.entries())
        .map(([algo, metrics]) => ({
          algorithm: algo,
          ...metrics
        }));
    }
  }
  