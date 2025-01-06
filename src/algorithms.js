import { getNeighbors, manhattanDistance, getUnvisitedNeighbors, getVisitedNeighbors, clearAroundNode } from './utils';

export const visualizeAlgorithm = async (algorithm, grid, startNode, endNode, animateVisitedNode, animatePath, setIsRunning) => {
  switch(algorithm) {
    case 'astar':
      return visualizeAstar(grid, startNode, endNode, animateVisitedNode, animatePath, setIsRunning);
    case 'dijkstra':
      return visualizeDijkstra(grid, startNode, endNode, animateVisitedNode, animatePath, setIsRunning);
    case 'bfs':
      return visualizeBFS(grid, startNode, endNode, animateVisitedNode, animatePath, setIsRunning);
    case 'dfs':
      return visualizeDFS(grid, startNode, endNode, animateVisitedNode, animatePath, setIsRunning);
    case 'greedy':
      return visualizeGreedyBestFirst(grid, startNode, endNode, animateVisitedNode, animatePath, setIsRunning);
    case 'bidirectional':
      return visualizeBidirectional(grid, startNode, endNode, animateVisitedNode, animatePath, setIsRunning);
    default:
      return visualizeAstar(grid, startNode, endNode, animateVisitedNode, animatePath, setIsRunning);
  }
};

// Pathfinding Algorithms
const visualizeAstar = async (grid, startNode, endNode, animateVisitedNode, animatePath, setIsRunning) => {
  const newGrid = grid.map(row => 
    row.map(node => ({
      ...node,
      isVisited: false,
      isPath: false,
      gScore: Infinity,
      fScore: Infinity,
      previousNode: null
    }))
  );

  const startNodeObj = newGrid[startNode.row][startNode.col];
  const endNodeObj = newGrid[endNode.row][endNode.col];
  startNodeObj.gScore = 0;
  startNodeObj.fScore = manhattanDistance(startNodeObj, endNodeObj);

  const openSet = [startNodeObj];
  const closedSet = new Set();

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.fScore - b.fScore);
    const current = openSet.shift();

    if (current === endNodeObj) {
      const path = [];
      let currentNode = current;
      while (currentNode) {
        path.unshift(currentNode);
        currentNode = currentNode.previousNode;
      }
      await animatePath(path);
      setIsRunning(false);
      return;
    }

    closedSet.add(current);
    await animateVisitedNode(current);

    for (const neighbor of getNeighbors(current, newGrid)) {
      if (closedSet.has(neighbor)) continue;

      const tentativeGScore = current.gScore + 1;

      if (!openSet.includes(neighbor)) {
        openSet.push(neighbor);
      } else if (tentativeGScore >= neighbor.gScore) {
        continue;
      }

      neighbor.previousNode = current;
      neighbor.gScore = tentativeGScore;
      neighbor.fScore = neighbor.gScore + manhattanDistance(neighbor, endNodeObj);
    }
  }

  setIsRunning(false);
};

const visualizeDijkstra = async (grid, startNode, endNode, animateVisitedNode, animatePath, setIsRunning) => {
  const newGrid = grid.map(row => 
    row.map(node => ({
      ...node,
      isVisited: false,
      isPath: false,
      distance: Infinity,
      previousNode: null
    }))
  );

  const startNodeObj = newGrid[startNode.row][startNode.col];
  const endNodeObj = newGrid[endNode.row][endNode.col];
  startNodeObj.distance = 0;

  const unvisitedNodes = [];
  for (const row of newGrid) {
    for (const node of row) {
      unvisitedNodes.push(node);
    }
  }

  while (unvisitedNodes.length) {
    unvisitedNodes.sort((a, b) => a.distance - b.distance);
    const closestNode = unvisitedNodes.shift();

    if (closestNode.distance === Infinity) break;

    await animateVisitedNode(closestNode);

    if (closestNode === endNodeObj) {
      const path = [];
      let currentNode = closestNode;
      while (currentNode) {
        path.unshift(currentNode);
        currentNode = currentNode.previousNode;
      }
      await animatePath(path);
      setIsRunning(false);
      return;
    }

    const neighbors = getNeighbors(closestNode, newGrid);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        const newDistance = closestNode.distance + 1;
        if (newDistance < neighbor.distance) {
          neighbor.distance = newDistance;
          neighbor.previousNode = closestNode;
        }
      }
    }
  }

  setIsRunning(false);
};

const visualizeBFS = async (grid, startNode, endNode, animateVisitedNode, animatePath, setIsRunning) => {
  const newGrid = grid.map(row =>
    row.map(node => ({
      ...node,
      isVisited: false,
      isPath: false,
      previousNode: null
    }))
  );

  const startNodeObj = newGrid[startNode.row][startNode.col];
  const endNodeObj = newGrid[endNode.row][endNode.col];
  const queue = [startNodeObj];
  const visited = new Set([startNodeObj]);

  while (queue.length) {
    const current = queue.shift();
    await animateVisitedNode(current);

    if (current === endNodeObj) {
      const path = [];
      let currentNode = current;
      while (currentNode) {
        path.unshift(currentNode);
        currentNode = currentNode.previousNode;
      }
      await animatePath(path);
      setIsRunning(false);
      return;
    }

    for (const neighbor of getNeighbors(current, newGrid)) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        neighbor.previousNode = current;
        queue.push(neighbor);
      }
    }
  }

  setIsRunning(false);
};

const visualizeDFS = async (grid, startNode, endNode, animateVisitedNode, animatePath, setIsRunning) => {
  const newGrid = grid.map(row =>
    row.map(node => ({
      ...node,
      isVisited: false,
      isPath: false,
      previousNode: null
    }))
  );

  const startNodeObj = newGrid[startNode.row][startNode.col];
  const endNodeObj = newGrid[endNode.row][endNode.col];
  const stack = [startNodeObj];
  const visited = new Set();

  while (stack.length) {
    const current = stack.pop();
    
    if (!visited.has(current)) {
      visited.add(current);
      await animateVisitedNode(current);

      if (current === endNodeObj) {
        const path = [];
        let currentNode = current;
        while (currentNode) {
          path.unshift(currentNode);
          currentNode = currentNode.previousNode;
        }
        await animatePath(path);
        setIsRunning(false);
        return;
      }

      const neighbors = getNeighbors(current, newGrid).reverse();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          neighbor.previousNode = current;
          stack.push(neighbor);
        }
      }
    }
  }

  setIsRunning(false);
};

const visualizeGreedyBestFirst = async (grid, startNode, endNode, animateVisitedNode, animatePath, setIsRunning) => {
  const newGrid = grid.map(row => 
    row.map(node => ({
      ...node,
      isVisited: false,
      isPath: false,
      previousNode: null
    }))
  );

  const startNodeObj = newGrid[startNode.row][startNode.col];
  const endNodeObj = newGrid[endNode.row][endNode.col];
  const openSet = [startNodeObj];
  const closedSet = new Set();

  while (openSet.length) {
    openSet.sort((a, b) => 
      manhattanDistance(a, endNodeObj) - manhattanDistance(b, endNodeObj)
    );
    
    const current = openSet.shift();
    
    if (current === endNodeObj) {
      const path = [];
      let currentNode = current;
      while (currentNode) {
        path.unshift(currentNode);
        currentNode = currentNode.previousNode;
      }
      await animatePath(path);
      setIsRunning(false);
      return;
    }

    closedSet.add(current);
    await animateVisitedNode(current);

    for (const neighbor of getNeighbors(current, newGrid)) {
      if (!closedSet.has(neighbor)) {
        neighbor.previousNode = current;
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  setIsRunning(false);
};

const visualizeBidirectional = async (grid, startNode, endNode, animateVisitedNode, animatePath, setIsRunning) => {
  const newGrid = grid.map(row => 
    row.map(node => ({
      ...node,
      isVisited: false,
      isPath: false,
      previousNode: null,
      previousNodeReverse: null
    }))
  );

  const startNodeObj = newGrid[startNode.row][startNode.col];
  const endNodeObj = newGrid[endNode.row][endNode.col];
  
  const forwardQueue = [startNodeObj];
  const backwardQueue = [endNodeObj];
  const forwardVisited = new Set([startNodeObj]);
  const backwardVisited = new Set([endNodeObj]);
  
  while (forwardQueue.length && backwardQueue.length) {
    // Forward search
    const currentForward = forwardQueue.shift();
    await animateVisitedNode(currentForward);

    if (backwardVisited.has(currentForward)) {
      await constructBidirectionalPath(currentForward, startNodeObj, endNodeObj, animatePath);
      setIsRunning(false);
      return;
    }

    for (const neighbor of getNeighbors(currentForward, newGrid)) {
      if (!forwardVisited.has(neighbor)) {
        forwardVisited.add(neighbor);
        neighbor.previousNode = currentForward;
        forwardQueue.push(neighbor);
      }
    }

    // Backward search
    const currentBackward = backwardQueue.shift();
    await animateVisitedNode(currentBackward);

    if (forwardVisited.has(currentBackward)) {
      await constructBidirectionalPath(currentBackward, startNodeObj, endNodeObj, animatePath);
      setIsRunning(false);
      return;
    }

    for (const neighbor of getNeighbors(currentBackward, newGrid)) {
      if (!backwardVisited.has(neighbor)) {
        backwardVisited.add(neighbor);
        neighbor.previousNodeReverse = currentBackward;
        backwardQueue.push(neighbor);
      }
    }
  }

  setIsRunning(false);
};

const constructBidirectionalPath = async (meetingNode, startNode, endNode, animatePath) => {
  const path = [];
  
  let current = meetingNode;
  while (current !== null) {
    path.unshift(current);
    current = current.previousNode;
  }
  
  current = meetingNode.previousNodeReverse;
  while (current !== null) {
    path.push(current);
    current = current.previousNodeReverse;
  }
  
  await animatePath(path);
};

// Maze Generation Algorithms
export const generateMaze = async (type, grid, startNode, endNode, setGrid, setIsRunning) => {
  switch(type) {
    case 'recursive':
      return generateRecursiveBacktrackingMaze(grid, startNode, endNode, setGrid, setIsRunning);
    case 'kruskals':
      return generateKruskalsMaze(grid, startNode, endNode, setGrid, setIsRunning);
    case 'huntandkill':
      return generateHuntAndKillMaze(grid, startNode, endNode, setGrid, setIsRunning);
    case 'sidewinder':
      return generateSidewinderMaze(grid, startNode, endNode, setGrid, setIsRunning);
    case 'prims':
      return generatePrimsMaze(grid, startNode, endNode, setGrid, setIsRunning);
    case 'random':
      return generateRandomMaze(grid, startNode, endNode, setGrid, setIsRunning);
    default:
      return generateRecursiveBacktrackingMaze(grid, startNode, endNode, setGrid, setIsRunning);
  }
};

const generateRecursiveBacktrackingMaze = async (grid, startNode, endNode, setGrid, setIsRunning) => {
  if (setIsRunning) setIsRunning(true);

  let newGrid = grid.map(row => row.map(node => ({...node, isWall: true})));
  setGrid([...newGrid]);

  const stack = [];
  const visited = new Set();
  const start = { row: 1, col: 1 };

  newGrid[start.row][start.col].isWall = false;
  visited.add(`${start.row},${start.col}`);
  stack.push(start);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = getUnvisitedNeighbors(current, newGrid, visited);

    if (neighbors.length === 0) {
      stack.pop();
    } else {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      const wallRow = current.row + Math.floor((next.row - current.row) / 2);
      const wallCol = current.col + Math.floor((next.col - current.col) / 2);
      
      newGrid[next.row][next.col].isWall = false;
      newGrid[wallRow][wallCol].isWall = false;
      visited.add(`${next.row},${next.col}`);
      stack.push(next);

      setGrid([...newGrid]);
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  newGrid[startNode.row][startNode.col].isWall = false;
  newGrid[endNode.row][endNode.col].isWall = false;
  clearAroundNode(startNode, newGrid);
  clearAroundNode(endNode, newGrid);
  
  setGrid([...newGrid]);
  if (setIsRunning) setIsRunning(false);
};

const generateKruskalsMaze = async (grid, startNode, endNode, setGrid, setIsRunning) => {
  if (setIsRunning) setIsRunning(true);

  let newGrid = grid.map(row => row.map(node => ({...node, isWall: true})));
  setGrid([...newGrid]);

  // Create sets for each cell
  const sets = new Map();
  for (let row = 1; row < grid.length - 1; row += 2) {
    for (let col = 1; col < grid[0].length - 1; col += 2) {
      newGrid[row][col].isWall = false;
      sets.set(`${row},${col}`, new Set([`${row},${col}`]));
    }
  }

  // Get all possible walls
  const walls = [];
  for (let row = 1; row < grid.length - 1; row += 2) {
    for (let col = 1; col < grid[0].length - 1; col += 2) {
      if (row + 2 < grid.length - 1) {
        walls.push({row: row + 1, col, cell1: `${row},${col}`, cell2: `${row + 2},${col}`});
      }
      if (col + 2 < grid[0].length - 1) {
        walls.push({row, col: col + 1, cell1: `${row},${col}`, cell2: `${row},${col + 2}`});
      }
    }
  }

  // Randomly remove walls
  while (walls.length > 0) {
    const wallIndex = Math.floor(Math.random() * walls.length);
    const wall = walls[wallIndex];
    walls.splice(wallIndex, 1);

    const set1 = sets.get(wall.cell1);
    const set2 = sets.get(wall.cell2);

    if (set1 !== set2) {
      newGrid[wall.row][wall.col].isWall = false;
      
      // Merge sets
      const newSet = new Set([...set1, ...set2]);
      for (const cell of newSet) {
        sets.set(cell, newSet);
      }

      setGrid([...newGrid]);
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  newGrid[startNode.row][startNode.col].isWall = false;
  newGrid[endNode.row][endNode.col].isWall = false;
  clearAroundNode(startNode, newGrid);
  clearAroundNode(endNode, newGrid);
  
  setGrid([...newGrid]);
  if (setIsRunning) setIsRunning(false);
};

const generateHuntAndKillMaze = async (grid, startNode, endNode, setGrid, setIsRunning) => {
  if (setIsRunning) setIsRunning(true);

  let newGrid = grid.map(row => row.map(node => ({...node, isWall: true})));
  setGrid([...newGrid]);

  const visited = new Set();
  let current = { row: 1, col: 1 };

  newGrid[current.row][current.col].isWall = false;
  visited.add(`${current.row},${current.col}`);

  while (current) {
    const unvisitedNeighbors = getUnvisitedNeighbors(current, newGrid, visited);
    
    if (unvisitedNeighbors.length > 0) {
      const next = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];
      const wallRow = current.row + Math.floor((next.row - current.row) / 2);
      const wallCol = current.col + Math.floor((next.col - current.col) / 2);
      
      newGrid[next.row][next.col].isWall = false;
      newGrid[wallRow][wallCol].isWall = false;
      visited.add(`${next.row},${next.col}`);
      current = next;

      setGrid([...newGrid]);
      await new Promise(resolve => setTimeout(resolve, 10));
    } else {
      // Hunt mode
      current = null;
      hunt: for (let row = 1; row < grid.length - 1; row += 2) {
        for (let col = 1; col < grid[0].length - 1; col += 2) {
          if (!visited.has(`${row},${col}`)) {
            const visitedNeighbors = getVisitedNeighbors({row, col}, newGrid, visited);
            if (visitedNeighbors.length > 0) {
              current = {row, col};
              const next = visitedNeighbors[Math.floor(Math.random() * visitedNeighbors.length)];
              const wallRow = current.row + Math.floor((next.row - current.row) / 2);
              const wallCol = current.col + Math.floor((next.col - current.col) / 2);
              
              newGrid[current.row][current.col].isWall = false;
              newGrid[wallRow][wallCol].isWall = false;
              visited.add(`${current.row},${current.col}`);
              
              setGrid([...newGrid]);
              await new Promise(resolve => setTimeout(resolve, 10));
              break hunt;
            }
          }
        }
      }
    }
  }

  newGrid[startNode.row][startNode.col].isWall = false;
  newGrid[endNode.row][endNode.col].isWall = false;
  clearAroundNode(startNode, newGrid);
  clearAroundNode(endNode, newGrid);
  
  setGrid([...newGrid]);
  if (setIsRunning) setIsRunning(false);
};

const generateSidewinderMaze = async (grid, startNode, endNode, setGrid, setIsRunning) => {
  if (setIsRunning) setIsRunning(true);

  let newGrid = grid.map(row => row.map(node => ({...node, isWall: true})));
  setGrid([...newGrid]);

  // Clear the top row
  for (let col = 1; col < grid[0].length - 1; col++) {
    newGrid[1][col].isWall = false;
    setGrid([...newGrid]);
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  // Process each row
  for (let row = 3; row < grid.length - 1; row += 2) {
    let runStart = 1;

    for (let col = 1; col < grid[0].length - 1; col += 2) {
      newGrid[row][col].isWall = false;
      setGrid([...newGrid]);
      await new Promise(resolve => setTimeout(resolve, 10));

      const atEasternBoundary = col + 2 >= grid[0].length - 1;
      const shouldCloseOut = atEasternBoundary || Math.random() < 0.5;

      if (shouldCloseOut) {
        const connectCol = runStart + 2 * Math.floor(Math.random() * ((col - runStart + 2) / 2));
        newGrid[row-1][connectCol].isWall = false;
        setGrid([...newGrid]);
        await new Promise(resolve => setTimeout(resolve, 10));
        runStart = col + 2;
      } else {
        newGrid[row][col+1].isWall = false;
        setGrid([...newGrid]);
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
  }

  newGrid[startNode.row][startNode.col].isWall = false;
  newGrid[endNode.row][endNode.col].isWall = false;
  clearAroundNode(startNode, newGrid);
  clearAroundNode(endNode, newGrid);

  setGrid([...newGrid]);
  if (setIsRunning) setIsRunning(false);
};

const generatePrimsMaze = async (grid, startNode, endNode, setGrid, setIsRunning) => {
  if (setIsRunning) setIsRunning(true);

  let newGrid = grid.map(row => row.map(node => ({...node, isWall: true})));
  setGrid([...newGrid]);

  const walls = new Set();
  const visited = new Set();
  
  const startX = Math.floor(grid[0].length / 4);
  const startY = Math.floor(grid.length / 2);

  const addWallsToList = (x, y) => {
    const directions = [[0, 2], [2, 0], [0, -2], [-2, 0]];
    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;
      if (newX > 0 && newX < grid[0].length - 1 &&
          newY > 0 && newY < grid.length - 1) {
        const wallX = x + dx/2;
        const wallY = y + dy/2;
        if (newGrid[wallY][wallX].isWall) {
          walls.add(`${wallY},${wallX}`);
        }
      }
    }
  };

  visited.add(`${startY},${startX}`);
  newGrid[startY][startX].isWall = false;
  addWallsToList(startX, startY);
  setGrid([...newGrid]);

  while (walls.size > 0) {
    const wallArray = Array.from(walls);
    const wallIndex = Math.floor(Math.random() * wallArray.length);
    const [wallY, wallX] = wallArray[wallIndex].split(',').map(Number);
    walls.delete(wallArray[wallIndex]);

    const directions = [
      [[-1, 0], [1, 0]],
      [[0, -1], [0, 1]]
    ];

    for (const [dir1, dir2] of directions) {
      const cell1Y = wallY + dir1[0];
      const cell1X = wallX + dir1[1];
      const cell2Y = wallY + dir2[0];
      const cell2X = wallX + dir2[1];

      if (cell1Y >= 0 && cell1Y < grid.length && 
          cell1X >= 0 && cell1X < grid[0].length &&
          cell2Y >= 0 && cell2Y < grid.length && 
          cell2X >= 0 && cell2X < grid[0].length) {
        
        const cell1Visited = visited.has(`${cell1Y},${cell1X}`);
        const cell2Visited = visited.has(`${cell2Y},${cell2X}`);

        if (cell1Visited !== cell2Visited) {
          newGrid[wallY][wallX].isWall = false;
          
          const [newY, newX] = cell1Visited ? [cell2Y, cell2X] : [cell1Y, cell1X];
          visited.add(`${newY},${newX}`);
          newGrid[newY][newX].isWall = false;
          addWallsToList(newX, newY);
          
          setGrid([...newGrid]);
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
    }
  }

  newGrid[startNode.row][startNode.col].isWall = false;
  newGrid[endNode.row][endNode.col].isWall = false;
  clearAroundNode(startNode, newGrid);
  clearAroundNode(endNode, newGrid);

  setGrid([...newGrid]);
  if (setIsRunning) setIsRunning(false);
};

const generateRandomMaze = async (grid, startNode, endNode, setGrid, setIsRunning) => {
  if (setIsRunning) setIsRunning(true);

  let newGrid = grid.map(row => row.map(node => ({...node, isWall: false})));
  
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      if ((row !== startNode.row || col !== startNode.col) &&
          (row !== endNode.row || col !== endNode.col)) {
        newGrid[row][col].isWall = Math.random() < 0.3;
        setGrid([...newGrid]);
        await new Promise(resolve => setTimeout(resolve, 2));
      }
    }
  }
  
  if (setIsRunning) setIsRunning(false);
};

export default {
  visualizeAlgorithm,
  generateMaze
};