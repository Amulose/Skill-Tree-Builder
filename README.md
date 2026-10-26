# SKILL TREE BUILDER

A web app for mapping out learning paths as interactive skill trees. Built with React, Vite, TypeScript, React Flow, and Tailwind CSS. No backend, no authentication, no external database. Your data stays in your browser via local storage

## Features

- Interactive graph canvas with pan and zoom
- Custom nodes with completed, available, and locked states
- Tree editor to add, rename, connect, and delete nodes
- Circular dependency prevention so you can't create impossible paths
- Fork any existing tree to customize your own copy
- Add external links and resources to individual skills
- Track progress and unlock new skills as you complete prerequisites
- Auto-layout button to snap messy nodes into a clean hierarchy
- Export your trees as high-quality PNG images
- Trash system to safely delete and restore trees
- Responsive mobile layout with slide-up panels
- Saves everything automatically to local storage

## Live Site for Testing

https://skill-tree-builder.amulose.vercel.app/

## Local Setup

```bash
npm install
npm run dev

Open `http://localhost:5173` in your browser

## Controls

**Viewer**
- Click a node to open details and view attached resources
- Click `Mark as Complete` to unlock its children
- Click the `Download` icon to export the graph as a PNG
- Use the minimap or scroll to navigate

**Editor**
- Click the `+` button to add a new node
- Click the `Wand` button to automatically arrange nodes
- Drag from the bottom dot of a node to the top dot of another to connect them
- Click a node to edit its title, time, and resources
- Click the `Settings` gear to edit the tree's category and description
- Click `Save` to commit changes to local storage

**Gallery**
- Click the `Trash` icon on a card to move it to the trash bin
- Click the `Trash` button in the header to restore or permanently delete trees

## Architecture

**`src/pages`** handles the three main routes. `Gallery` manages the grid, search, forking, and the trash system. `Viewer` renders the read-only graph with progress tracking, mobile layouts, and image exporting. `Editor` wraps the graph in a `ReactFlowProvider` and enables node creation, edge connections, and resource management

**`src/components`** contains the custom `SkillNode` which renders the visual state of each node using glassmorphism and hover animations

**`src/lib/graph.ts`** holds the core logic. `getNodeStates` walks the edge list to determine which nodes are locked, available, or completed. `wouldCreateCycle` runs a depth-first search before a new edge is added to prevent infinite loops. `getAutoLayout` uses the Dagre library to calculate a clean top-to-bottom hierarchy

**`src/storage.ts`** is a thin wrapper over `localStorage` that handles loading and saving trees and progress separately. Progress is keyed by tree ID so forking a tree starts with a clean slate

## Known Limitations

- Data is stored in local storage so clearing browser data wipes your trees
- No way to export or import tree data as JSON files yet
- No backend so progress cannot sync across devices
- The editor does not have undo or redo
```
