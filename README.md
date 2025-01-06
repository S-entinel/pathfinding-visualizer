Pathfinding Visualizer
An interactive visualization tool for pathfinding algorithms built with React. This project allows users to explore various pathfinding algorithms and maze generation techniques in a responsive, digital-themed interface.

You can view the tool here: https://pathfinding-visualizer-mu-sepia.vercel.app

Features
Pathfinding Algorithms

A Search* - Uses heuristics for optimal pathfinding
Dijkstra's Algorithm - Guarantees shortest path
Breadth-First Search - Explores nodes level by level
Depth-First Search - Explores as far as possible along each branch
Greedy Best-First Search - Uses heuristics without considering path cost
Bidirectional Search - Searches from both start and end points

Maze Generation Algorithms

Recursive Backtracking - Creates complex, winding paths
Kruskal's Algorithm - Generates a maze using a minimum spanning tree
Hunt and Kill - Creates mazes with long corridors
Sidewinder - Generates mazes with a notable horizontal bias
Prim's Algorithm - Creates mazes using a minimum spanning tree approach
Random Pattern - Generates random wall patterns

Interactive Features

Real-time visualization of algorithm execution
Adjustable visualization speed
Interactive grid with wall placement
Draggable start and end points
Undo/Redo functionality (Ctrl+Z, Ctrl+Y)
Performance statistics (nodes visited, path length)

Technical Details
Built With

React.js
TailwindCSS
Lucide React Icons

Key Implementation Details

Efficient grid state management using React hooks
Custom animation system for visualization
Modular architecture separating algorithms, utilities, and UI
Responsive design with a digital theme
Error handling for algorithm execution

Getting Started
Prerequisites

Node.js (version 14 or higher)
npm or yarn

Installation

Clone the repository

bashCopygit clone https://github.com/yourusername/pathfinding-visualizer.git

Install dependencies

bashCopycd pathfinding-visualizer
npm install

Start the development server

bashCopynpm start
Usage

Select an Algorithm: Choose from the dropdown menu of available pathfinding algorithms
Generate Maze (Optional): Select a maze generation pattern from the dropdown
Customize Grid:

Click and drag to create walls
Use the START and END tools to reposition nodes
Use RESET to clear the grid


Adjust Speed: Use the slider to control visualization speed
Visualize: Click START to begin the visualization

Contributing
Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.
License
This project is licensed under the MIT License - see the LICENSE.md file for details

