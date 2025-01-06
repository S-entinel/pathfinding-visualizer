// Grid initialization utilities
export function initializeNode(row, col) {
  return {
    row,
    col,
    isWall: false,
    isVisited: false,
    isPath: false,
    distance: Infinity,
    gScore: Infinity,
    fScore: Infinity,
    previousNode: null,
    previousNodeReverse: null,
    direction: 'up',
    weight: 1
  };
}

export function initializeGrid({ rows, cols }) {
  return Array(rows).fill().map((_, row) => 
    Array(cols).fill().map((_, col) => initializeNode(row, col))
  );
}

// Algorithm utilities
export const getNeighbors = (node, grid) => {
  const neighbors = [];
  const { row, col } = node;
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  for (const [dRow, dCol] of directions) {
    const newRow = row + dRow;
    const newCol = col + dCol;
    if (newRow >= 0 && newRow < grid.length && 
        newCol >= 0 && newCol < grid[0].length && 
        !grid[newRow][newCol].isWall) {
      neighbors.push(grid[newRow][newCol]);
    }
  }
  return neighbors;
};

export const manhattanDistance = (nodeA, nodeB) => {
  return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
};

export const getUnvisitedNeighbors = (cell, grid, visited) => {
  const neighbors = [];
  const directions = [[-2, 0], [2, 0], [0, -2], [0, 2]];

  for (const [dx, dy] of directions) {
    const newRow = cell.row + dy;
    const newCol = cell.col + dx;
    
    if (newRow > 0 && newRow < grid.length - 1 && 
        newCol > 0 && newCol < grid[0].length - 1 && 
        !visited.has(`${newRow},${newCol}`)) {
      neighbors.push({row: newRow, col: newCol});
    }
  }

  return neighbors;
};

export const getVisitedNeighbors = (cell, grid, visited) => {
  const neighbors = [];
  const directions = [[-2, 0], [2, 0], [0, -2], [0, 2]];

  for (const [dx, dy] of directions) {
    const newRow = cell.row + dy;
    const newCol = cell.col + dx;
    
    if (newRow > 0 && newRow < grid.length - 1 && 
        newCol > 0 && newCol < grid[0].length - 1 && 
        visited.has(`${newRow},${newCol}`)) {
      neighbors.push({row: newRow, col: newCol});
    }
  }

  return neighbors;
};

export const clearAroundNode = (node, grid) => {
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dy, dx] of directions) {
    const newRow = node.row + dy;
    const newCol = node.col + dx;
    if (newRow >= 0 && newRow < grid.length && 
        newCol >= 0 && newCol < grid[0].length) {
      grid[newRow][newCol].isWall = false;
    }
  }
};

export const isWalkable = (col, row, grid) => {
  return row >= 0 && row < grid.length && 
         col >= 0 && col < grid[0].length && 
         !grid[row][col].isWall;
};

export const hasForceNeighbor = (row, col, dx, dy, grid) => {
  // For horizontal movement
  if (dy === 0) {
    // Check cells above and below
    if (isWalkable(col, row, grid)) {
      if (!isWalkable(col, row - 1, grid) && isWalkable(col + dx, row - 1, grid)) return true;
      if (!isWalkable(col, row + 1, grid) && isWalkable(col + dx, row + 1, grid)) return true;
    }
  }
  // For vertical movement
  else if (dx === 0) {
    // Check cells left and right
    if (isWalkable(col, row, grid)) {
      if (!isWalkable(col - 1, row, grid) && isWalkable(col - 1, row + dy, grid)) return true;
      if (!isWalkable(col + 1, row, grid) && isWalkable(col + 1, row + dy, grid)) return true;
    }
  }
  // For diagonal movement
  else {
    if (isWalkable(col, row, grid)) {
      if (!isWalkable(col - dx, row, grid) && isWalkable(col - dx, row + dy, grid)) return true;
      if (!isWalkable(col, row - dy, grid) && isWalkable(col + dx, row - dy, grid)) return true;
    }
  }
  return false;
};

// Animation helpers
export const getDelay = (visualizationSpeed) => {
  // Convert speed (1-100) to delay (500ms - 5ms)
  return Math.max(5, 500 - (visualizationSpeed * 5));
};