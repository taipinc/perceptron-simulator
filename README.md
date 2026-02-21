# Perceptron Mark I Simulator

Interactive web simulation of the Perceptron Mark I for classroom teaching.

## Architecture

- **Retina**: 20x20 binary pixel grid (400 inputs)
- **Association Layer**: 512 units with fixed random connections to the retina
- **Output Layer**: 2 trainable units with editable labels

## Setup

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages

```bash
npm run deploy
```

This builds the project and publishes the `dist` folder to the `gh-pages` branch.

Make sure GitHub Pages is configured to serve from the `gh-pages` branch in your repository settings.

## Stack

- Vite + React
- Tailwind CSS
- Plain JavaScript perceptron math (no ML libraries)
