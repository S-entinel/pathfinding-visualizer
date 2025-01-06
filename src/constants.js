// Animation and styling constants
export const CUSTOM_STYLES = `
  .digital-container {
    position: relative;
    overflow: hidden;
    background: #000000;
  }

  .digital-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: repeating-linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.03) 0px,
      rgba(255, 255, 255, 0.03) 1px,
      transparent 1px,
      transparent 2px
    );
    pointer-events: none;
  }

  .digital-grid {
    background: 
      linear-gradient(to right, rgba(255, 255, 255, 0.07) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.07) 1px, transparent 1px);
    background-size: 20px 20px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 
      inset 0 0 30px rgba(0, 0, 0, 0.5),
      0 0 10px rgba(255, 255, 255, 0.05);
    padding: 1px;
  }

  .digital-cell {
    width: 20px;
    height: 20px;
    position: relative;
    transition: background-color 0.2s ease;
  }

  .digital-cell.wall {
    background: rgba(255, 255, 255, 0.15);
    box-shadow: inset 0 0 2px rgba(255, 255, 255, 0.3);
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
      background-color: rgba(255, 255, 255, 0.95);
      border-radius: 2px;
    }
    50% {
      background-color: rgba(255, 255, 255, 0.7);
    }
    75% {
      transform: scale(1.2);
      background-color: rgba(255, 255, 255, 0.5);
    }
    100% {
      transform: scale(1);
      background-color: rgba(255, 255, 255, 0.3);
    }
  }

  .node-path {
    animation: pathAnimation 0.5s forwards;
  }

  @keyframes pathAnimation {
    0% {
      transform: scale(0.6);
      background-color: rgba(255, 255, 255, 0.95);
    }
    100% {
      transform: scale(1);
      background-color: rgba(255, 255, 255, 1);
      box-shadow: 
        0 0 15px rgba(255, 255, 255, 0.7),
        0 0 3px rgba(255, 255, 255, 1);
    }
  }

  .start-marker {
    width: 12px;
    height: 12px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    box-shadow: 0 0 5px #fff;
    z-index: 2;
  }

  .start-marker::before,
  .start-marker::after {
    content: '';
    position: absolute;
    background: #fff;
  }

  .start-marker::before {
    width: 6px;
    height: 2px;
    top: -4px;
    left: 3px;
  }

  .start-marker::after {
    width: 2px;
    height: 6px;
    top: 3px;
    left: -4px;
  }

  .end-marker {
    width: 2px;
    height: 16px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    box-shadow: 0 0 5px #fff;
    z-index: 2;
  }

  .end-marker::before,
  .end-marker::after {
    content: '';
    position: absolute;
    width: 6px;
    height: 2px;
    background: #fff;
    left: -2px;
  }

  .end-marker::before {
    top: 0;
  }

  .end-marker::after {
    bottom: 0;
  }

  .digital-button {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    font-family: monospace;
    transition: all 0.2s;
  }

  .digital-button:hover:not(:disabled) {
    border-color: rgba(255, 255, 255, 0.8);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
  }

  .digital-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .digital-select {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    font-family: monospace;
  }

  .digital-select:focus {
    border-color: rgba(255, 255, 255, 0.8);
    outline: none;
  }
`;

// Default grid settings
export const DEFAULT_GRID_SIZE = { rows: 25, cols: 50 };
export const DEFAULT_START_NODE = { row: 13, col: 5 };
export const DEFAULT_END_NODE = { row: 13, col: 45 };