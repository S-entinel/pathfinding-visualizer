class MazePatternGenerator {
    constructor(grid, updateCallback) {
      this.grid = grid;
      this.updateCallback = updateCallback;
      this.patterns = new Map([
        ['fractal', this.generateFractalMaze.bind(this)],
        ['cellular', this.generateCellularAutomataMaze.bind(this)],
        ['prims', this.generatePrimsMaze.bind(this)],
        ['kruskals', this.generateKruskalsMaze.bind(this)]
      ]);
    }
  
    async generateFractalMaze() {
      // Implementation of fractal-based maze generation
      const subdivide = async (x1, y1, x2, y2, depth) => {
        if (depth === 0 || x2 - x1 < 3 || y2 - y1 < 3) return;
        
        const midX = Math.floor((x1 + x2) / 2);
        const midY = Math.floor((y1 + y2) / 2);
        
        // Create perpendicular walls through center
        await this.createWallWithGap(x1, midX, y1, y2, 'vertical');
        await this.createWallWithGap(x1, x2, midY, midY, 'horizontal');
        
        // Recursively subdivide quadrants
        await Promise.all([
          subdivide(x1, y1, midX, midY, depth - 1),
          subdivide(midX, y1, x2, midY, depth - 1),
          subdivide(x1, midY, midX, y2, depth - 1),
          subdivide(midX, midY, x2, y2, depth - 1)
        ]);
      };
      
      await subdivide(0, 0, this.grid[0].length - 1, this.grid.length - 1, 4);
    }
  
    async generateCellularAutomataMaze() {
      // Implementation of cellular automata maze generation
      const applyRules = (grid) => {
        const newGrid = structuredClone(grid);
        for (let i = 1; i < grid.length - 1; i++) {
          for (let j = 1; j < grid[0].length - 1; j++) {
            const neighbors = this.countWallNeighbors(grid, i, j);
            newGrid[i][j].isWall = neighbors >= 5;
          }
        }
        return newGrid;
      };
  
      // Initialize with random walls
      this.randomizeWalls(0.4);
      
      // Apply cellular automata rules
      for (let i = 0; i < 4; i++) {
        this.grid = applyRules(this.grid);
        await this.updateCallback(this.grid);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  
    // Helper method for wall neighbor counting
    countWallNeighbors(grid, row, col) {
      let count = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          const r = row + i;
          const c = col + j;
          if (r >= 0 && r < grid.length && c >= 0 && c < grid[0].length) {
            count += grid[r][c].isWall ? 1 : 0;
          }
        }
      }
      return count;
    }
}