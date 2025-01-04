import { useState, useEffect, useCallback } from 'react';
import { Settings, RotateCcw, Play, Pause, Undo2, Redo2, X } from 'lucide-react';
import bgImage from './9267508f048077b25064fbd82bc77fcb.jpg'


// Animation styles for nodes
const CUSTOM_STYLES = `
  /* Base theme colors from 3B1B */
  :root {
    --3b1b-background: #1e1e2e;
    --3b1b-blue: #3b83f6;
    --3b1b-highlight: #60a5fa;
    --3b1b-text: #e2e8f0;
    --3b1b-secondary: #94a3b8;
  }

  .node-visited {
    animation-name: visitedAnimation;
    animation-duration: 1.5s;
    animation-timing-function: ease-out;
    animation-delay: 0;
    animation-direction: alternate;
    animation-iteration-count: 1;
    animation-fill-mode: forwards;
    animation-play-state: running;
  }

  @keyframes visitedAnimation {
    0% {
      transform: scale(0.3);
      background-color: rgba(59, 131, 246, 0.3);
      border-radius: 100%;
    }
    50% {
      background-color: rgba(59, 131, 246, 0.5);
    }
    75% {
      transform: scale(1.2);
      background-color: rgba(59, 131, 246, 0.7);
    }
    100% {
      transform: scale(1);
      background-color: rgba(59, 131, 246, 0.4);
    }
  }

  .node-path {
    animation: pathPulse 2s ease-in-out infinite;
    background-color: var(--3b1b-blue);
    box-shadow: 0 0 8px var(--3b1b-blue);
  }

  @keyframes pathPulse {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 8px var(--3b1b-blue);
    }
    50% {
      transform: scale(1);
      box-shadow: 0 0 15px var(--3b1b-blue);
    }
    100% {
      transform: scale(0.95);
      box-shadow: 0 0 8px var(--3b1b-blue);
    }
  }

  .mathematical-select {
    background-color: rgba(30, 30, 46, 0.8);
    border: 1px solid rgba(59, 131, 246, 0.3);
    color: var(--3b1b-text);
    transition: all 0.2s ease;
  }

  .mathematical-select:hover:not(:disabled) {
    border-color: var(--3b1b-blue);
  }

  .mathematical-button {
    background-color: rgba(30, 30, 46, 0.8);
    border: 1px solid rgba(59, 131, 246, 0.3);
    color: var(--3b1b-text);
    transition: all 0.2s ease;
  }

  .mathematical-button:hover:not(:disabled) {
    border-color: var(--3b1b-blue);
    background-color: rgba(59, 131, 246, 0.1);
  }

  .mathematical-button.active {
    background-color: var(--3b1b-blue);
    border-color: var(--3b1b-blue);
    color: white;
  }
`;


// Main component
const PathfindingVisualizer = () => {
  // State management
  const [gridSize, setGridSize] = useState({ rows: 20, cols: 40 });
  const [grid, setGrid] = useState(() => initializeGrid(gridSize));
  const [isMousePressed, setIsMousePressed] = useState(false);
  const [startNode, setStartNode] = useState({ row: 10, col: 5 });
  const [endNode, setEndNode] = useState({ row: 10, col: 35 });
  const [currentTool, setCurrentTool] = useState('wall');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [visualizationSpeed, setVisualizationSpeed] = useState(50);
  const [currentAlgorithm, setCurrentAlgorithm] = useState('astar');
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isWallOperation, setIsWallOperation] = useState(false);


  // Grid initialization
  function initializeNode(row, col) {
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

  function initializeGrid({ rows, cols }) {
    return Array(rows).fill().map((_, row) => 
      Array(cols).fill().map((_, col) => initializeNode(row, col))
    );
  }

  // Effect to reset grid when size changes
  useEffect(() => {
    setGrid(initializeGrid(gridSize));
  }, [gridSize]);

  // Mouse event handlers
  const handleMouseDown = (row, col) => {
    if (isRunning) return;

    if (currentTool === 'wall') {
      if ((row === startNode.row && col === startNode.col) ||
          (row === endNode.row && col === endNode.col)) return;
      
      const newGrid = [...grid];
      newGrid[row][col] = {
        ...newGrid[row][col],
        isWall: !newGrid[row][col].isWall
      };
      setIsWallOperation(true);

      const newHistory = history.slice(0, currentStep + 1);
      newHistory.push(grid);
      setHistory(newHistory);
      setCurrentStep(currentStep + 1);

      setGrid(newGrid);
      setIsMousePressed(true);
    } 



    else if (currentTool === 'start') {
      if (row === endNode.row && col === endNode.col) return;
      setStartNode({ row, col });
    } 
    else if (currentTool === 'end') {
      if (row === startNode.row && col === startNode.col) return;
      setEndNode({ row, col });
    }
  };

  const handleMouseEnter = (row, col) => {
    if (!isMousePressed || currentTool !== 'wall' || isRunning) return;
    if ((row === startNode.row && col === startNode.col) ||
        (row === endNode.row && col === endNode.col)) return;
    
    const newGrid = [...grid];
    newGrid[row][col] = {
      ...newGrid[row][col],
      isWall: true
    };
    setGrid(newGrid);
  };

  const handleUndo = () => {
    if (currentStep > 0 && !isRunning) {
      setCurrentStep(currentStep - 1);
      setGrid(JSON.parse(JSON.stringify(history[currentStep - 1])));
    }
  };

  const handleRedo = () => {
    if (currentStep < history.length - 1 && !isRunning) {
      setCurrentStep(currentStep + 1);
      setGrid(JSON.parse(JSON.stringify(history[currentStep + 1])));
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.metaKey || e.ctrlKey) && !isRunning) {
        if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
        } else if (e.key === 'y') {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStep, history, isRunning]);


  const handleMouseUp = () => {
    if (isWallOperation) {
      setIsWallOperation(false);
    }
    setIsMousePressed(false);
  };

  // Grid reset
  const resetGrid = () => {
    if (isRunning) return;
    const newGrid = initializeGrid(gridSize);
    setGrid(newGrid);
    resetStats();
  };

  // Algorithm utilities
  const getNeighbors = (node, grid) => {
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

  const manhattanDistance = (nodeA, nodeB) => {
    return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
  };

  const [stats, setStats] = useState({
    nodesVisited: 0,
    pathLength: 0,
    executionTime: 0,
    isComputing: false,
    pathFound: false
  });
  
  // Add stats reset function
  const resetStats = () => {
    setStats({
      nodesVisited: 0,
      pathLength: 0,
      executionTime: 0,
      isComputing: false,
      pathFound: false
    });
  };
  

  // Animation helpers
  const animateVisitedNode = async (node) => {
    if (node !== grid[startNode.row][startNode.col] && 
        node !== grid[endNode.row][endNode.col]) {
      const newGrid = [...grid];
      newGrid[node.row][node.col] = {
        ...node,
        isVisited: true
      };
      setGrid(newGrid);
      setStats(prev => ({
        ...prev,
        nodesVisited: prev.nodesVisited + 1
      }));
      await new Promise(resolve => setTimeout(resolve, getDelay()));
    }
  };



const animatePath = async (path) => {
  setStats(prev => ({
    ...prev,
    pathLength: path.length - 2, // Subtract start and end nodes
    pathFound: true,
    isComputing: false
  }));

  for (const node of path) {
    if (node !== grid[startNode.row][startNode.col] && 
        node !== grid[endNode.row][endNode.col]) {
      const newGrid = [...grid];
      newGrid[node.row][node.col] = {
        ...node,
        isPath: true
      };
      setGrid(newGrid);
      await new Promise(resolve => setTimeout(resolve, getDelay() * 2));
    }
  }
};




// Algorithm implementations
const visualizeAstar = async () => {
  if (isRunning) return;
  setIsRunning(true);

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

const visualizeDijkstra = async () => {
  if (isRunning) return;
  setIsRunning(true);

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

const visualizeBFS = async () => {
  if (isRunning) return;
  setIsRunning(true);

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

const visualizeDFS = async () => {
  if (isRunning) return;
  setIsRunning(true);

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

const visualizeGreedyBestFirst = async () => {
  if (isRunning) return;
  setIsRunning(true);

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

const visualizeBidirectional = async () => {
  if (isRunning) return;
  setIsRunning(true);

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
      await constructBidirectionalPath(currentForward, startNodeObj, endNodeObj);
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
      await constructBidirectionalPath(currentBackward, startNodeObj, endNodeObj);
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

const constructBidirectionalPath = async (meetingNode, startNode, endNode) => {
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

const generatePrimsMaze = async () => {
  if (isRunning) return;
  setIsRunning(true);

  let newGrid = initializeGrid(gridSize);
  
  // Initialize all cells as walls
  for (let row = 0; row < gridSize.rows; row++) {
    for (let col = 0; col < gridSize.cols; col++) {
      newGrid[row][col].isWall = true;
    }
  }
  setGrid([...newGrid]);

  // Create passage at start and end nodes
  newGrid[startNode.row][startNode.col].isWall = false;
  newGrid[endNode.row][endNode.col].isWall = false;

  const walls = new Set();
  const visited = new Set();
  
  // Start from a quarter way into the grid for better distribution
  const startX = Math.floor(gridSize.cols / 4);
  const startY = Math.floor(gridSize.rows / 2);
  
  const addWallsToList = (x, y) => {
    const directions = [[0, 2], [2, 0], [0, -2], [-2, 0]];
    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;
      if (newX > 0 && newX < gridSize.cols - 1 &&
          newY > 0 && newY < gridSize.rows - 1) {
        const wallX = x + dx/2;
        const wallY = y + dy/2;
        if (newGrid[wallY][wallX].isWall) {
          walls.add(`${wallY},${wallX}`);
        }
      }
    }
  };

  // Mark starting point and add its walls
  visited.add(`${startY},${startX}`);
  newGrid[startY][startX].isWall = false;
  addWallsToList(startX, startY);
  setGrid([...newGrid]);

  while (walls.size > 0) {
    const wallArray = Array.from(walls);
    const wallIndex = Math.floor(Math.random() * wallArray.length);
    const [wallY, wallX] = wallArray[wallIndex].split(',').map(Number);
    walls.delete(wallArray[wallIndex]);

    // Find cells on both sides of the wall
    const directions = [
      [[-1, 0], [1, 0]],  // Vertical wall
      [[0, -1], [0, 1]]   // Horizontal wall
    ];

    for (const [dir1, dir2] of directions) {
      const cell1Y = wallY + dir1[0];
      const cell1X = wallX + dir1[1];
      const cell2Y = wallY + dir2[0];
      const cell2X = wallX + dir2[1];

      if (cell1Y >= 0 && cell1Y < gridSize.rows && 
          cell1X >= 0 && cell1X < gridSize.cols &&
          cell2Y >= 0 && cell2Y < gridSize.rows && 
          cell2X >= 0 && cell2X < gridSize.cols) {
        
        const cell1Visited = visited.has(`${cell1Y},${cell1X}`);
        const cell2Visited = visited.has(`${cell2Y},${cell2X}`);

        if (cell1Visited !== cell2Visited) {  // Only one cell visited
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

  // Ensure path to start and end nodes
  const clearPathToNode = (node) => {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dy, dx] of directions) {
      const newY = node.row + dy;
      const newX = node.col + dx;
      if (newY >= 0 && newY < gridSize.rows &&
          newX >= 0 && newX < gridSize.cols) {
        newGrid[newY][newX].isWall = false;
      }
    }
  };

  clearPathToNode(startNode);
  clearPathToNode(endNode);
  setGrid([...newGrid]);
  await new Promise(resolve => setTimeout(resolve, getDelay() / 5));
  
  setIsRunning(false);
};


const generateGrowingTreeMaze = async () => {
  if (isRunning) return;
  setIsRunning(true);

  let newGrid = initializeGrid(gridSize);
  // Fill with walls
  for (let row = 0; row < gridSize.rows; row++) {
    for (let col = 0; col < gridSize.cols; col++) {
      newGrid[row][col].isWall = true;
    }
  }
  setGrid([...newGrid]);

  const cells = [];
  // Start with a random cell
  const startX = 1 + 2 * Math.floor(Math.random() * Math.floor((gridSize.cols - 2) / 2));
  const startY = 1 + 2 * Math.floor(Math.random() * Math.floor((gridSize.rows - 2) / 2));
  
  cells.push({row: startY, col: startX});
  newGrid[startY][startX].isWall = false;
  setGrid([...newGrid]);

  const directions = [[-2, 0], [2, 0], [0, -2], [0, 2]];

  while (cells.length > 0) {
    // Mix between newest (recursive backtracker) and random (Prim's) selection
    const index = Math.random() < 0.5 ? cells.length - 1 : Math.floor(Math.random() * cells.length);
    const cell = cells[index];

    // Get unvisited neighbors
    const neighbors = [];
    for (const [dy, dx] of directions) {
      const newRow = cell.row + dy;
      const newCol = cell.col + dx;
      if (newRow > 0 && newRow < gridSize.rows - 1 && 
          newCol > 0 && newCol < gridSize.cols - 1 && 
          newGrid[newRow][newCol].isWall) {
        neighbors.push({row: newRow, col: newCol});
      }
    }

    if (neighbors.length > 0) {
      // Choose random neighbor
      const neighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      
      // Carve passage
      newGrid[neighbor.row][neighbor.col].isWall = false;
      newGrid[cell.row + (neighbor.row - cell.row) / 2][cell.col + (neighbor.col - cell.col) / 2].isWall = false;
      
      cells.push(neighbor);
      setGrid([...newGrid]);
      await new Promise(resolve => setTimeout(resolve, 10));
    } else {
      // Remove cell with no unvisited neighbors
      cells.splice(index, 1);
    }
  }

  // Ensure start and end are accessible
  newGrid[startNode.row][startNode.col].isWall = false;
  newGrid[endNode.row][endNode.col].isWall = false;

  // Clear areas around start and end
  const clearAroundNode = (node) => {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dy, dx] of directions) {
      const newRow = node.row + dy;
      const newCol = node.col + dx;
      if (newRow >= 0 && newRow < gridSize.rows && 
          newCol >= 0 && newCol < gridSize.cols) {
        newGrid[newRow][newCol].isWall = false;
      }
    }
  };

  clearAroundNode(startNode);
  clearAroundNode(endNode);

  setGrid([...newGrid]);
  setIsRunning(false);
};

// Keep the existing random maze generator as is
const generateRandomMaze = async () => {
  if (isRunning) return;
  setIsRunning(true);

  let newGrid = initializeGrid(gridSize);
  
  for (let row = 0; row < gridSize.rows; row++) {
    for (let col = 0; col < gridSize.cols; col++) {
      if ((row !== startNode.row || col !== startNode.col) &&
          (row !== endNode.row || col !== endNode.col)) {
        newGrid[row][col].isWall = Math.random() < 0.3;
        setGrid([...newGrid]);
        await new Promise(resolve => setTimeout(resolve, getDelay() / 5));
      }
    }
  }
  
  setIsRunning(false);
};


const generateSidewinderMaze = async () => {
  if (isRunning) return;
  setIsRunning(true);

  let newGrid = initializeGrid(gridSize);
  // Fill with walls initially
  for (let row = 0; row < gridSize.rows; row++) {
    for (let col = 0; col < gridSize.cols; col++) {
      newGrid[row][col].isWall = true;
    }
  }
  setGrid([...newGrid]);

  // Clear the top row
  for (let col = 1; col < gridSize.cols - 1; col++) {
    newGrid[1][col].isWall = false;
    setGrid([...newGrid]);
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  // Process each row
  for (let row = 3; row < gridSize.rows - 1; row += 2) {
    let runStart = 1;

    for (let col = 1; col < gridSize.cols - 1; col += 2) {
      newGrid[row][col].isWall = false;
      setGrid([...newGrid]);
      await new Promise(resolve => setTimeout(resolve, 10));

      const atEasternBoundary = col + 2 >= gridSize.cols - 1;
      const shouldCloseOut = atEasternBoundary || Math.random() < 0.5;

      if (shouldCloseOut) {
        // Choose a random cell from the run to connect upward
        const connectCol = runStart + 2 * Math.floor(Math.random() * ((col - runStart + 2) / 2));
        
        // Carve the northern passage
        newGrid[row-1][connectCol].isWall = false;
        setGrid([...newGrid]);
        await new Promise(resolve => setTimeout(resolve, 10));

        // Start a new run
        runStart = col + 2;
      } else {
        // Carve the eastern passage
        newGrid[row][col+1].isWall = false;
        setGrid([...newGrid]);
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
  }

  // Ensure path to start and end nodes
  newGrid[startNode.row][startNode.col].isWall = false;
  newGrid[endNode.row][endNode.col].isWall = false;

  // Clear areas around start and end nodes
  const clearAround = (node) => {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dy, dx] of directions) {
      const newRow = node.row + dy;
      const newCol = node.col + dx;
      if (newRow >= 0 && newRow < gridSize.rows && 
          newCol >= 0 && newCol < gridSize.cols) {
        newGrid[newRow][newCol].isWall = false;
      }
    }
  };

  clearAround(startNode);
  clearAround(endNode);

  // Create a few random connections to make the maze more interesting
  for (let i = 0; i < Math.floor(gridSize.rows / 4); i++) {
    const row = 1 + 2 * Math.floor(Math.random() * Math.floor((gridSize.rows - 2) / 2));
    const col = 1 + 2 * Math.floor(Math.random() * Math.floor((gridSize.cols - 2) / 2));
    
    if (Math.random() < 0.5) {
      // Vertical connection
      if (row + 1 < gridSize.rows - 1) {
        newGrid[row + 1][col].isWall = false;
      }
    } else {
      // Horizontal connection
      if (col + 1 < gridSize.cols - 1) {
        newGrid[row][col + 1].isWall = false;
      }
    }
  }

  setGrid([...newGrid]);
  setIsRunning(false);
};



const generateRecursiveBacktrackingMaze = async () => {
  if (isRunning) return;
  setIsRunning(true);

  let newGrid = initializeGrid(gridSize);
  // Fill with walls initially
  for (let row = 0; row < gridSize.rows; row++) {
    for (let col = 0; col < gridSize.cols; col++) {
      newGrid[row][col].isWall = true;
    }
  }
  setGrid([...newGrid]);

  const stack = [];
  const visited = new Set();
  const start = {
    row: 1,
    col: 1
  };

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

  // Ensure path to start and end
  newGrid[startNode.row][startNode.col].isWall = false;
  newGrid[endNode.row][endNode.col].isWall = false;
  
  // Clear some walls around start/end
  clearAroundNode(startNode, newGrid);
  clearAroundNode(endNode, newGrid);
  
  setGrid([...newGrid]);
  setIsRunning(false);
};

const generateKruskalsMaze = async () => {
  if (isRunning) return;
  setIsRunning(true);

  let newGrid = initializeGrid(gridSize);
  // Fill with walls
  for (let row = 0; row < gridSize.rows; row++) {
    for (let col = 0; col < gridSize.cols; col++) {
      newGrid[row][col].isWall = true;
    }
  }
  setGrid([...newGrid]);

  // Create sets for each cell
  const sets = new Map();
  for (let row = 1; row < gridSize.rows - 1; row += 2) {
    for (let col = 1; col < gridSize.cols - 1; col += 2) {
      newGrid[row][col].isWall = false;
      sets.set(`${row},${col}`, new Set([`${row},${col}`]));
    }
  }

  // Get all possible walls
  const walls = [];
  for (let row = 1; row < gridSize.rows - 1; row += 2) {
    for (let col = 1; col < gridSize.cols - 1; col += 2) {
      if (row + 2 < gridSize.rows - 1) {
        walls.push({row: row + 1, col, cell1: `${row},${col}`, cell2: `${row + 2},${col}`});
      }
      if (col + 2 < gridSize.cols - 1) {
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

  // Ensure path to start and end
  newGrid[startNode.row][startNode.col].isWall = false;
  newGrid[endNode.row][endNode.col].isWall = false;
  clearAroundNode(startNode, newGrid);
  clearAroundNode(endNode, newGrid);
  
  setGrid([...newGrid]);
  setIsRunning(false);
};

const generateHuntAndKillMaze = async () => {
  if (isRunning) return;
  setIsRunning(true);

  let newGrid = initializeGrid(gridSize);
  // Fill with walls
  for (let row = 0; row < gridSize.rows; row++) {
    for (let col = 0; col < gridSize.cols; col++) {
      newGrid[row][col].isWall = true;
    }
  }
  setGrid([...newGrid]);

  const visited = new Set();
  let current = {
    row: 1,
    col: 1
  };

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
      hunt: for (let row = 1; row < gridSize.rows - 1; row += 2) {
        for (let col = 1; col < gridSize.cols - 1; col += 2) {
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

  // Ensure path to start and end
  newGrid[startNode.row][startNode.col].isWall = false;
  newGrid[endNode.row][endNode.col].isWall = false;
  clearAroundNode(startNode, newGrid);
  clearAroundNode(endNode, newGrid);
  
  setGrid([...newGrid]);
  setIsRunning(false);
};


const getUnvisitedNeighbors = (cell, grid, visited) => {
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

const getVisitedNeighbors = (cell, grid, visited) => {
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

const clearAroundNode = (node, grid) => {
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


const getDelay = useCallback(() => {
  // Convert speed (1-100) to delay (500ms - 5ms)
  return Math.max(5, 500 - (visualizationSpeed * 5));
}, [visualizationSpeed]);



const identifySuccessors = async (node, grid, start, end) => {
  const successors = [];
  const neighbors = pruneNeighbors(node, grid, start);

  for (const neighbor of neighbors) {
    const jumpPoint = await jump(neighbor.x, neighbor.y, node.col, node.row, grid, start, end);
    if (jumpPoint) {
      const [jx, jy] = jumpPoint;
      if (!grid[jy][jx].isVisited) {
        const jumpNode = grid[jy][jx];
        jumpNode.gScore = node.gScore + manhattanDistance(node, jumpNode);
        jumpNode.fScore = jumpNode.gScore + manhattanDistance(jumpNode, grid[end.row][end.col]);
        jumpNode.previousNode = node;
        successors.push(jumpNode);
      }
    }
  }
  return successors;
};

const pruneNeighbors = (node, grid, start) => {
  const neighbors = [];
  const dirs = getDirections(node, grid, start);

  for (const [dx, dy] of dirs) {
    const x = node.col + dx;
    const y = node.row + dy;
    if (isWalkable(x, y, grid)) {
      neighbors.push({ x, y });
    }
  }
  return neighbors;
};

const getDirections = (node, grid, start) => {
  if (node.row === start.row && node.col === start.col) {
    return [[-1,0], [1,0], [0,-1], [0,1], [-1,-1], [-1,1], [1,-1], [1,1]];
  }

  const parent = node.previousNode;
  if (!parent) return [];

  const dx = Math.sign(node.col - parent.col);
  const dy = Math.sign(node.row - parent.row);

  if (dx !== 0 && dy !== 0) {
    // Diagonal movement
    const dirs = [[dx,dy]];
    if (isWalkable(node.col, node.row + dy, grid)) dirs.push([0,dy]);
    if (isWalkable(node.col + dx, node.row, grid)) dirs.push([dx,0]);
    return dirs;
  } else {
    // Straight movement
    const dirs = [];
    if (dx === 0) {
      dirs.push([0,dy]);
      if (!isWalkable(node.col - 1, node.row, grid)) dirs.push([-1,dy]);
      if (!isWalkable(node.col + 1, node.row, grid)) dirs.push([1,dy]);
    } else {
      dirs.push([dx,0]);
      if (!isWalkable(node.col, node.row - 1, grid)) dirs.push([dx,-1]);
      if (!isWalkable(node.col, node.row + 1, grid)) dirs.push([dx,1]);
    }
    return dirs;
  }
};


const visualizeJPS = async () => {
  if (isRunning) return;
  setIsRunning(true);

  const newGrid = grid.map(row =>
    row.map(node => ({
      ...node,
      isVisited: false,
      isPath: false,
      distance: Infinity,
      previousNode: null
    }))
  );

  const openSet = [];
  const closedSet = new Set();
  const startNodeObj = newGrid[startNode.row][startNode.col];
  const endNodeObj = newGrid[endNode.row][endNode.col];
  
  startNodeObj.distance = 0;
  startNodeObj.fScore = manhattanDistance(startNodeObj, endNodeObj);
  openSet.push(startNodeObj);

  while (openSet.length > 0) {
    openSet.sort((a, b) => (a.distance + manhattanDistance(a, endNodeObj)) - 
                          (b.distance + manhattanDistance(b, endNodeObj)));
    const current = openSet.shift();
    
    if (current === endNodeObj) {
      const path = [];
      let currentNode = current;
      while (currentNode !== null) {
        path.unshift(currentNode);
        currentNode = currentNode.previousNode;
      }
      await animatePath(path);
      setIsRunning(false);
      return;
    }

    if (closedSet.has(`${current.row},${current.col}`)) continue;
    closedSet.add(`${current.row},${current.col}`);

    if (current !== startNodeObj && current !== endNodeObj) {
      await animateVisitedNode(current);
    }

    const successors = await findJumpPoints(current, newGrid, startNodeObj, endNodeObj);
    for (const successor of successors) {
      if (closedSet.has(`${successor.row},${successor.col}`)) continue;

      const tentativeDistance = current.distance + manhattanDistance(current, successor);

      if (!openSet.includes(successor)) {
        successor.distance = tentativeDistance;
        successor.previousNode = current;
        openSet.push(successor);
      } else if (tentativeDistance < successor.distance) {
        successor.distance = tentativeDistance;
        successor.previousNode = current;
      }
    }
  }

  setIsRunning(false);
};

const findJumpPoints = async (node, grid, startNode, endNode) => {
  const successors = [];
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1],  // Cardinal directions
    [-1, -1], [-1, 1], [1, -1], [1, 1]  // Diagonal directions
  ];

  for (const [dx, dy] of directions) {
    const jumpPoint = await jump(node.row, node.col, dx, dy, grid, startNode, endNode);
    if (jumpPoint) {
      successors.push(jumpPoint);
    }
  }

  return successors;
};

const jump = async (currentRow, currentCol, dx, dy, grid, startNode, endNode) => {
  const nextRow = currentRow + dy;
  const nextCol = currentCol + dx;

  // Check bounds and walls
  if (!isWalkable(nextCol, nextRow, grid)) return null;

  // Found end node
  if (nextRow === endNode.row && nextCol === endNode.col) {
    return grid[nextRow][nextCol];
  }

  // Mark as visited for visualization
  if (grid[nextRow][nextCol] !== grid[startNode.row][startNode.col] && 
      grid[nextRow][nextCol] !== grid[endNode.row][endNode.col]) {
    grid[nextRow][nextCol].isVisited = true;
    await animateVisitedNode(grid[nextRow][nextCol]);
  }

  // Check for forced neighbors
  if (hasForceNeighbor(nextRow, nextCol, dx, dy, grid)) {
    return grid[nextRow][nextCol];
  }

  // Diagonal movement
  if (dx !== 0 && dy !== 0) {
    // Check horizontal and vertical jumps
    if (await jump(nextRow, nextCol, dx, 0, grid, startNode, endNode) !== null ||
        await jump(nextRow, nextCol, 0, dy, grid, startNode, endNode) !== null) {
      return grid[nextRow][nextCol];
    }
  }

  // Continue jumping
  return await jump(nextRow, nextCol, dx, dy, grid, startNode, endNode);
};

const hasForceNeighbor = (row, col, dx, dy, grid) => {
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

const isWalkable = (col, row, grid) => {
  return row >= 0 && row < grid.length && 
         col >= 0 && col < grid[0].length && 
         !grid[row][col].isWall;
};



// Algorithm selection handler
const visualizeAlgorithm = () => {
  if (isRunning) return;
  resetStats();
  setStats(prev => ({ ...prev, isComputing: true }));
  const startTime = performance.now();
  switch(currentAlgorithm) {
    case 'astar': 
      visualizeAstar();
      break;
    case 'dijkstra':
      visualizeDijkstra();
      break;
    case 'bfs':
      visualizeBFS();
      break;
    case 'dfs':
      visualizeDFS();
      break;
    case 'greedy':
      visualizeGreedyBestFirst();
      break;
    case 'jps':
      visualizeJPS();
      
    case 'bidirectional':
      visualizeBidirectional();
      break;
    default:
      visualizeAstar();
  }
  setStats(prev => ({
    ...prev,
    executionTime: Math.round(performance.now() - startTime)
  }));
};

const getDirectionClass = (node) => {
  if (!node.isPath || !node.previousNode) return '';
  
  const prev = node.previousNode;
  const dx = node.col - prev.col;
  const dy = node.row - prev.row;
  
  if (dx > 0) return 'path-arrow right';
  if (dx < 0) return 'path-arrow left';
  if (dy > 0) return 'path-arrow down';
  if (dy < 0) return 'path-arrow up';
  return '';
};

useEffect(() => {
  setHistory([grid]);
  setCurrentStep(0);
}, [gridSize]);


const StatsPanel = ({ stats }) => (
  <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 border border-gray-800 text-white min-w-[180px]">
    <div className="space-y-1.5 text-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-400">Status:</span>
        <span className={stats.isComputing ? 'text-yellow-400' : stats.pathFound ? 'text-green-400' : 'text-gray-200'}>
          {stats.isComputing ? 'Computing...' : 
           stats.pathFound ? 'Path Found' : 'Ready'}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-gray-400">Nodes Visited:</span>
        <span className="text-gray-200">{stats.nodesVisited}</span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-gray-400">Path Length:</span>
        <span className="text-gray-200">
          {stats.pathFound ? stats.pathLength : '-'}
        </span>
      </div>
    </div>
  </div>
);


// Main render
return (
  <div className="h-screen relative overflow-hidden bg-[#1e1e2e]">
    {/* Main content */}
    <div className="relative z-10 h-full flex flex-col p-2">
      <style>{CUSTOM_STYLES}</style>
      
      {/* Unified Toolbar */}
      <div className="bg-[#1e1e2e]/90 backdrop-blur-sm rounded-lg border border-[#3b83f6]/20">
        {/* Title Row */}
        <div className="p-3 border-b border-[#3b83f6]/20">
          <h1 className="text-xl font-medium text-[#e2e8f0]">
            Pathfinding Visualizer
          </h1>
        </div>

        {/* Controls Row */}
        <div className="p-3 border-b border-[#3b83f6]/20">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-[#94a3b8] mb-1">Algorithm</label>
              <select
                className="mathematical-select w-full rounded px-3 py-1.5"
                value={currentAlgorithm}
                onChange={(e) => setCurrentAlgorithm(e.target.value)}
                disabled={isRunning}
              >
                <option value="astar">A* Search</option>
                <option value="dijkstra">Dijkstra's Algorithm</option>
                <option value="bfs">Breadth-First Search</option>
                <option value="dfs">Depth-First Search</option>
                <option value="greedy">Greedy Best-First Search</option>
                <option value="bidirectional">Bidirectional Search</option>
                <option value="jps">Jump Point Search</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#94a3b8] mb-1">Generate Maze</label>
              <select
                className="mathematical-select w-full rounded px-3 py-1.5"
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value) return;
                  switch (value) {
                    case 'recursive': generateRecursiveBacktrackingMaze(); break;
                    case 'kruskals': generateKruskalsMaze(); break;
                    case 'huntandkill': generateHuntAndKillMaze(); break;
                    case 'sidewinder': generateSidewinderMaze(); break;
                    case 'random': generateRandomMaze(); break;
                    case 'prims': generatePrimsMaze(); break;
                    case 'growingtree': generateGrowingTreeMaze(); break;
                  }
                  e.target.value = '';
                }}
                disabled={isRunning}
              >
                <option value="">Select Pattern</option>
                <option value="recursive">Recursive Backtracking</option>
                <option value="kruskals">Kruskal's Algorithm</option>
                <option value="huntandkill">Hunt and Kill</option>
                <option value="sidewinder">Sidewinder</option>
                <option value="prims">Prim's Algorithm</option>
                <option value="growingtree">Growing Tree</option>
                <option value="random">Random Pattern</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                className={`px-4 py-1.5 rounded flex items-center gap-2 mathematical-button ${
                  isRunning ? 'opacity-50 cursor-not-allowed' : 'active'
                }`}
                onClick={visualizeAlgorithm}
                disabled={isRunning}
              >
                {isRunning ? <Pause size={16} /> : <Play size={16} />}
                <span>{isRunning ? 'Running...' : 'Start'}</span>
              </button>

              <div className="flex items-center gap-2 bg-[#1e1e2e]/80 rounded px-3 py-1.5 border border-[#3b83f6]/20">
                <Pause className="w-4 h-4 text-[#94a3b8]" />
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={visualizationSpeed}
                  onChange={(e) => setVisualizationSpeed(Number(e.target.value))}
                  className="w-24 accent-[#3b83f6]"
                  disabled={isRunning}
                />
                <Play className="w-4 h-4 text-[#94a3b8]" />
              </div>
            </div>
          </div>
        </div>

        {/* Tools Row */}
        <div className="p-3 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              className={`mathematical-button px-4 py-1.5 rounded ${
                currentTool === 'wall' ? 'active' : ''
              }`}
              onClick={() => !isRunning && setCurrentTool('wall')}
              disabled={isRunning}
            >
              Walls
            </button>
            <button
              className={`mathematical-button px-4 py-1.5 rounded ${
                currentTool === 'start' ? 'active' : ''
              }`}
              onClick={() => !isRunning && setCurrentTool('start')}
              disabled={isRunning}
            >
              Start
            </button>
            <button
              className={`mathematical-button px-4 py-1.5 rounded ${
                currentTool === 'end' ? 'active' : ''
              }`}
              onClick={() => !isRunning && setCurrentTool('end')}
              disabled={isRunning}
            >
              End
            </button>

            <div className="h-full border-l border-[#3b83f6]/20 mx-2" />
            <button
              className="mathematical-button px-4 py-1.5 rounded"
              onClick={resetGrid}
              disabled={isRunning}
            >
              Reset
            </button>
          </div>

          <div className="flex gap-2">
            <button
              className={`mathematical-button p-1.5 rounded ${
                currentStep > 0 && !isRunning ? '' : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={handleUndo}
              disabled={currentStep <= 0 || isRunning}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={16} />
            </button>
            <button
              className={`mathematical-button p-1.5 rounded ${
                currentStep < history.length - 1 && !isRunning ? '' : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={handleRedo}
              disabled={currentStep >= history.length - 1 || isRunning}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 flex justify-center items-center relative">
        {/* Stats Panel */}
        <div className="absolute top-4 right-4 bg-[#1e1e2e]/90 backdrop-blur-sm rounded-lg p-3 border border-[#3b83f6]/20">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-[#94a3b8]">Status:</span>
              <span className={
                stats.isComputing 
                  ? 'text-[#60a5fa]' 
                  : stats.pathFound 
                    ? 'text-[#3b83f6]' 
                    : 'text-[#e2e8f0]'
              }>
                {stats.isComputing ? 'Computing...' : stats.pathFound ? 'Path Found' : 'Ready'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#94a3b8]">Nodes Visited:</span>
              <span className="text-[#e2e8f0]">{stats.nodesVisited}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#94a3b8]">Path Length:</span>
              <span className="text-[#e2e8f0]">
                {stats.pathFound ? stats.pathLength : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="bg-[#1e1e2e]/90 backdrop-blur-sm rounded-lg p-4 border border-[#3b83f6]/20">
          <div 
            className="grid gap-px"
            style={{
              gridTemplateColumns: `repeat(${gridSize.cols}, 1.5rem)`,
            }}
            onMouseLeave={handleMouseUp}
          >
            {grid.map((row, rowIdx) =>
              row.map((node, colIdx) => (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className={`
                    w-6 h-6 rounded-sm transition-all duration-150
                    ${node.isWall ? 'bg-[#1e1e2e] border border-[#3b83f6]/30' : ''}
                    ${node.isVisited && !node.isPath ? 'node-visited' : ''}
                    ${node.isPath ? 'node-path' : ''}
                    ${startNode.row === rowIdx && startNode.col === colIdx ? 'start-node' : ''}
                    ${endNode.row === rowIdx && endNode.col === colIdx ? 'end-node' : ''}
                    ${!node.isWall && !node.isVisited && !node.isPath && 
                      !(startNode.row === rowIdx && startNode.col === colIdx) && 
                      !(endNode.row === rowIdx && endNode.col === colIdx) ? 'bg-[#e2e8f0]/10' : ''}
                  `}
                  onMouseDown={() => handleMouseDown(rowIdx, colIdx)}
                  onMouseEnter={() => handleMouseEnter(rowIdx, colIdx)}
                  onMouseUp={handleMouseUp}
                >
                  {startNode.row === rowIdx && startNode.col === colIdx && (
                    <div className="w-full h-full flex items-center justify-center text-[#3b83f6]">
                      <div className="w-3 h-3 rounded-full bg-current" />
                    </div>
                  )}
                  {endNode.row === rowIdx && endNode.col === colIdx && (
                    <div className="w-full h-full flex items-center justify-center text-[#3b83f6]">
                      <div className="w-2 h-2 rounded-full bg-current" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);};

export default PathfindingVisualizer;

