import { useState, useEffect, useCallback } from 'react';
import { Settings, RotateCcw, Play, Pause, Undo2, Redo2 } from 'lucide-react';
import { CUSTOM_STYLES, DEFAULT_GRID_SIZE, DEFAULT_START_NODE, DEFAULT_END_NODE } from './constants';
import { initializeGrid, getDelay } from './utils';
import { visualizeAlgorithm, generateMaze } from './algorithms';

const PathfindingVisualizer = () => {
  // State management
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [grid, setGrid] = useState(() => initializeGrid(gridSize));
  const [isMousePressed, setIsMousePressed] = useState(false);
  const [startNode, setStartNode] = useState(DEFAULT_START_NODE);
  const [endNode, setEndNode] = useState(DEFAULT_END_NODE);
  const [currentTool, setCurrentTool] = useState('wall');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [visualizationSpeed, setVisualizationSpeed] = useState(50);
  const [currentAlgorithm, setCurrentAlgorithm] = useState('astar');
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isWallOperation, setIsWallOperation] = useState(false);
  const [stats, setStats] = useState({
    nodesVisited: 0,
    pathLength: 0,
    executionTime: 0,
    isComputing: false,
    pathFound: false
  });

  // Reset stats
  const resetStats = () => {
    setStats({
      nodesVisited: 0,
      pathLength: 0,
      executionTime: 0,
      isComputing: false,
      pathFound: false
    });
  };

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

  const handleMouseUp = () => {
    if (isWallOperation) {
      setIsWallOperation(false);
    }
    setIsMousePressed(false);
  };

  // History management
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

  // Keyboard shortcuts
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

  // Grid reset
  const resetGrid = () => {
    if (isRunning) return;
    const newGrid = initializeGrid(gridSize);
    setGrid(newGrid);
    resetStats();
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
      await new Promise(resolve => setTimeout(resolve, getDelay(visualizationSpeed)));
    }
  };

  const animatePath = async (path) => {
    setStats(prev => ({
      ...prev,
      pathLength: path.length - 2,
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
        await new Promise(resolve => setTimeout(resolve, getDelay(visualizationSpeed) * 2));
      }
    }
  };

  // Algorithm visualization
  const handleVisualize = () => {
    if (isRunning) return;
    resetStats();
    setStats(prev => ({ ...prev, isComputing: true }));
    const startTime = performance.now();
    
    visualizeAlgorithm(
      currentAlgorithm,
      grid,
      startNode,
      endNode,
      animateVisitedNode,
      animatePath,
      setIsRunning
    ).then(() => {
      setStats(prev => ({
        ...prev,
        executionTime: Math.round(performance.now() - startTime)
      }));
    });
  };

  // Maze generation
  const handleGenerateMaze = (type) => {
    if (isRunning) return;
    generateMaze(type, grid, startNode, endNode, setGrid, setIsRunning);
  };

  useEffect(() => {
    setHistory([grid]);
    setCurrentStep(0);
  }, [gridSize]);

  // Main render
  return (
    <div className="min-h-screen digital-container">
      <style>{CUSTOM_STYLES}</style>
      
      <div className="p-4 space-y-4">
        {/* Header with Stats */}
        <div className="flex justify-between items-center">
          <h1 className="font-mono text-xl tracking-wider text-white">PATHFINDING_VISUALIZER</h1>
          <div className="flex gap-8 px-4 py-2 border border-white/20">
            <div className="flex items-center gap-2">
              <span className="text-white/50 font-mono">STATUS</span>
              <span className="text-white font-mono">
                {stats.isComputing ? 'COMPUTING' : stats.pathFound ? 'PATH_FOUND' : 'READY'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/50 font-mono">NODES</span>
              <span className="text-white font-mono">
                {stats.nodesVisited.toString().padStart(5, '0')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/50 font-mono">LENGTH</span>
              <span className="text-white font-mono">
                {stats.pathFound ? stats.pathLength.toString().padStart(3, '0') : '---'}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block font-mono text-sm text-white/50 mb-2">/SELECT_ALGORITHM</label>
            <select
              className="digital-select w-full px-3 py-2"
              value={currentAlgorithm}
              onChange={(e) => setCurrentAlgorithm(e.target.value)}
              disabled={isRunning}
            >
              <option value="astar">A*_SEARCH</option>
              <option value="dijkstra">DIJKSTRA</option>
              <option value="bfs">BREADTH_FIRST</option>
              <option value="dfs">DEPTH_FIRST</option>
              <option value="greedy">GREEDY_BEST</option>
              <option value="bidirectional">BIDIRECTIONAL</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-sm text-white/50 mb-2">/GENERATE_MAZE</label>
            <select
              className="digital-select w-full px-3 py-2"
              onChange={(e) => {
                const value = e.target.value;
                if (!value) return;
                handleGenerateMaze(value);
                e.target.value = '';
              }}
              disabled={isRunning}
            >
              <option value="">SELECT_PATTERN</option>
              <option value="recursive">RECURSIVE_BACKTRACKING</option>
              <option value="kruskals">KRUSKALS</option>
              <option value="huntandkill">HUNT_AND_KILL</option>
              <option value="sidewinder">SIDEWINDER</option>
              <option value="prims">PRIMS</option>
              <option value="random">RANDOM</option>
            </select>
          </div>

          <div className="flex items-end gap-3">
            <button
              className="digital-button px-4 py-2 flex items-center gap-2"
              onClick={handleVisualize}
              disabled={isRunning}
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
              <span className="font-mono">
                {isRunning ? 'RUNNING' : 'START'}
              </span>
            </button>

            <div className="flex items-center gap-2 px-3 py-2 border border-white/20">
              <input
                type="range"
                min="1"
                max="100"
                value={visualizationSpeed}
                onChange={(e) => setVisualizationSpeed(Number(e.target.value))}
                className="w-24 accent-white"
                disabled={isRunning}
              />
            </div>
          </div>
        </div>

        {/* Tools */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              className={`digital-button px-4 py-2 ${
                currentTool === 'wall' ? 'border-white/80 bg-white/10' : ''
              }`}
              onClick={() => !isRunning && setCurrentTool('wall')}
              disabled={isRunning}
            >
              <span className="font-mono">WALLS</span>
            </button>
            <button
              className={`digital-button px-4 py-2 ${
                currentTool === 'start' ? 'border-white/80 bg-white/10' : ''
              }`}
              onClick={() => !isRunning && setCurrentTool('start')}
              disabled={isRunning}
            >
              <span className="font-mono">START</span>
            </button>
            <button
              className={`digital-button px-4 py-2 ${
                currentTool === 'end' ? 'border-white/80 bg-white/10' : ''
              }`}
              onClick={() => !isRunning && setCurrentTool('end')}
              disabled={isRunning}
            >
              <span className="font-mono">END</span>
            </button>
            <button
              className="digital-button px-4 py-2"
              onClick={resetGrid}
              disabled={isRunning}
            >
              <span className="font-mono">RESET</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button
              className={`digital-button p-2 ${
                currentStep > 0 && !isRunning ? '' : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={handleUndo}
              disabled={currentStep <= 0 || isRunning}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={18} />
            </button>
            <button
              className={`digital-button p-2 ${
                currentStep < history.length - 1 && !isRunning ? '' : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={handleRedo}
              disabled={currentStep >= history.length - 1 || isRunning}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 size={18} />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex justify-center mt-8">
          <div className="digital-grid">
            <div 
              className="grid gap-0"
              style={{
                gridTemplateColumns: `repeat(${gridSize.cols}, 20px)`,
              }}
              onMouseLeave={handleMouseUp}
            >
              {grid.map((row, rowIdx) =>
                row.map((node, colIdx) => (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className={`
                      digital-cell
                      ${node.isWall ? 'wall' : ''}
                      ${node.isVisited && !node.isPath ? 'node-visited' : ''}
                      ${node.isPath ? 'node-path' : ''}
                    `}
                    onMouseDown={() => handleMouseDown(rowIdx, colIdx)}
                    onMouseEnter={() => handleMouseEnter(rowIdx, colIdx)}
                    onMouseUp={handleMouseUp}
                  >
                    {startNode.row === rowIdx && startNode.col === colIdx && (
                      <div className="start-marker" />
                    )}
                    {endNode.row === rowIdx && endNode.col === colIdx && (
                      <div className="end-marker" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathfindingVisualizer;