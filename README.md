# SKILL TREE BUILDER

A web app for mapping out learning paths as interactive skill trees. Built with React, Vite, TypeScript, React Flow, and Tailwind CSS. No backend, no authentication, no external database. Your data stays in your browser via local storage

## Features

- Interactive graph canvas with pan and zoom
- Custom nodes with completed, available, and locked states
- Tree editor to add, rename, connect, and delete nodes
- Circular dependency prevention so you can't create impossible paths
- Fork any existing tree to customize your own copy
- Track progress and unlock new skills as you complete prerequisites
- Saves everything automatically to local storage

## Live Demo

https://skill-tree-builder.amulose.vercel.app/

## Local Setup

```bash
npm install
npm run dev
