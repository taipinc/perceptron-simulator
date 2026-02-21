# Perceptron Mark I Simulator

## Project Overview
Interactive web simulation of Rosenblatt's Perceptron Mark I (1958) for classroom teaching. Deployed to GitHub Pages.

## Stack
- Vite + React + Tailwind CSS v4 (@tailwindcss/vite plugin)
- No ML libraries — all math in `src/perceptron.js`
- Deployed via `gh-pages` package

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run deploy` — build + deploy to GitHub Pages

## Architecture
- **Retina**: 20x20 binary pixel grid (400 pixels)
- **Association layer**: 512 units with fixed random connections to retina, 30% firing threshold
- **Output layer**: 2 units with trainable weights (perceptron learning rule)

## Key Files
- `src/perceptron.js` — core math (forward pass, learning rule, receptive field computation)
- `src/App.jsx` — top-level state, layout with card system
- `src/components/NetworkViz.jsx` — SVG + Canvas network architecture diagram
  - Canvas renders all 1536 connection lines (bezier curves) for performance
  - SVG renders layer shapes, labels, arrows
- `src/components/DrawableGrid.jsx` — 20x20 drawable canvas with brush/eraser
- `src/components/ReceptiveFieldViz.jsx` — weight projection back onto retina space
- `src/components/WeightViz.jsx` — weight grid visualization per output class
- `src/components/AssociationLayer.jsx` — association unit activity grid
- `src/components/OutputPanel.jsx` — scores + editable class labels
- `src/components/ControlPanel.jsx` — learning rate, learn buttons, reset
- `src/index.css` — card system (.card, .card-green, .card-blue, .card-yellow, .card-red)

## Design System
- Font: Helvetica Neue (body), Space Mono (labels, monospace elements)
- Background: warm paper (#f0ebe3)
- Thick 3px black borders, 24px rounded cards
- Color-coded sections: blue (retina), green (association), yellow (controls/weights), coral (output)

## Deployment
- Repo: https://github.com/taipinc/perceptron-simulator
- Live: https://taipinc.github.io/perceptron-simulator/
- Base path configured in `vite.config.js` as `/perceptron-simulator/`

## Notes
- 4-class output was attempted but abandoned — learning rule penalizes 3 units per step causing weight drift
- Canvas connections use devicePixelRatio scaling for crisp rendering on retina displays
- Connection lines are stable (deterministic indices, no random sampling per render)
- Webcam and predefined shapes components exist but are unused (tabs removed)
