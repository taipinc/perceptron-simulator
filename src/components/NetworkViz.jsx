import { useMemo, useRef, useEffect, useState } from 'react';
import { RETINA_SIZE, NUM_ASSOCIATION } from '../perceptron';

// Layout constants
const LAYER_GAP = 160;
const RETINA_VIZ_SIZE = 200;
const ASSOC_VIZ_W = 120;
const ASSOC_VIZ_H = 320;
const OUTPUT_VIZ_H = 200;
const OUTPUT_VIZ_W = 80;
const TOP_PAD = 60;

// How many connections to show (sampling for performance)
const MAX_RETINA_ASSOC_LINES = 80;
const MAX_ASSOC_OUTPUT_LINES = 40;

function RetinaLayer({ retina, x, y }) {
  const cellSize = RETINA_VIZ_SIZE / RETINA_SIZE;
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Background */}
      <rect
        width={RETINA_VIZ_SIZE}
        height={RETINA_VIZ_SIZE}
        rx={8}
        fill="#f3f4f6"
        stroke="#d1d5db"
        strokeWidth={1.5}
      />
      {/* Pixels */}
      {retina.map((val, i) => {
        const row = Math.floor(i / RETINA_SIZE);
        const col = i % RETINA_SIZE;
        return (
          <rect
            key={i}
            x={col * cellSize + 0.5}
            y={row * cellSize + 0.5}
            width={cellSize - 1}
            height={cellSize - 1}
            fill={val ? '#1a1a1a' : '#ffffff'}
            rx={1}
          />
        );
      })}
      {/* Label */}
      <text
        x={RETINA_VIZ_SIZE / 2}
        y={-12}
        textAnchor="middle"
        className="text-xs font-semibold"
        fill="#6b7280"
      >
        Retina (20x20)
      </text>
    </g>
  );
}

function AssociationLayerViz({ activations, x, y }) {
  // Show association units as a grid of dots
  const cols = 8;
  const rows = Math.ceil(NUM_ASSOCIATION / cols);
  const dotSize = Math.min(
    (ASSOC_VIZ_W - 16) / cols,
    (ASSOC_VIZ_H - 16) / rows
  );
  const padX = (ASSOC_VIZ_W - cols * dotSize) / 2;
  const padY = (ASSOC_VIZ_H - rows * dotSize) / 2;

  const numActive = activations ? activations.reduce((s, v) => s + v, 0) : 0;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        width={ASSOC_VIZ_W}
        height={ASSOC_VIZ_H}
        rx={8}
        fill="#f3f4f6"
        stroke="#d1d5db"
        strokeWidth={1.5}
      />
      {Array.from({ length: NUM_ASSOCIATION }, (_, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const active = activations && activations[i] > 0;
        return (
          <circle
            key={i}
            cx={padX + col * dotSize + dotSize / 2}
            cy={padY + row * dotSize + dotSize / 2}
            r={dotSize * 0.3}
            fill={active ? '#3b82f6' : '#d1d5db'}
          />
        );
      })}
      <text
        x={ASSOC_VIZ_W / 2}
        y={-12}
        textAnchor="middle"
        className="text-xs font-semibold"
        fill="#6b7280"
      >
        Association (512)
      </text>
      <text
        x={ASSOC_VIZ_W / 2}
        y={ASSOC_VIZ_H + 16}
        textAnchor="middle"
        className="text-[10px]"
        fill="#9ca3af"
      >
        {numActive} active
      </text>
    </g>
  );
}

function OutputLayerViz({ scores, labels, prediction, x, y, weights }) {
  const unitH = 60;
  const unitW = OUTPUT_VIZ_W;
  const gap = 30;
  const totalH = unitH * 2 + gap;
  const startY = (OUTPUT_VIZ_H - totalH) / 2;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        width={OUTPUT_VIZ_W}
        height={OUTPUT_VIZ_H}
        rx={8}
        fill="#f3f4f6"
        stroke="#d1d5db"
        strokeWidth={1.5}
      />
      {[0, 1].map((idx) => {
        const isWinner = prediction === idx;
        const cy = startY + idx * (unitH + gap) + unitH / 2;
        return (
          <g key={idx} transform={`translate(0, ${startY + idx * (unitH + gap)})`}>
            <rect
              x={8}
              y={0}
              width={unitW - 16}
              height={unitH}
              rx={6}
              fill={isWinner ? '#dbeafe' : '#ffffff'}
              stroke={isWinner ? '#3b82f6' : '#d1d5db'}
              strokeWidth={isWinner ? 2 : 1}
            />
            <text
              x={unitW / 2}
              y={22}
              textAnchor="middle"
              className="text-[10px] font-medium"
              fill="#374151"
            >
              {labels[idx]}
            </text>
            <text
              x={unitW / 2}
              y={40}
              textAnchor="middle"
              className="text-xs font-mono"
              fill={isWinner ? '#2563eb' : '#6b7280'}
            >
              {scores ? scores[idx].toFixed(2) : '—'}
            </text>
            {isWinner && (
              <text
                x={unitW / 2}
                y={54}
                textAnchor="middle"
                className="text-[8px] font-bold"
                fill="#2563eb"
              >
                PREDICTED
              </text>
            )}
          </g>
        );
      })}
      <text
        x={OUTPUT_VIZ_W / 2}
        y={-12}
        textAnchor="middle"
        className="text-xs font-semibold"
        fill="#6b7280"
      >
        Output
      </text>
    </g>
  );
}

function Connections({
  retina,
  associationUnits,
  activations,
  weights,
  scores,
  prediction,
  retinaPos,
  assocPos,
  outputPos,
}) {
  // Sample connections from retina to association layer
  const retinaToAssoc = useMemo(() => {
    const lines = [];
    // Pick a subset of association units that are active, plus some inactive
    const activeIndices = [];
    const inactiveIndices = [];
    for (let i = 0; i < NUM_ASSOCIATION; i++) {
      if (activations && activations[i] > 0) {
        activeIndices.push(i);
      } else {
        inactiveIndices.push(i);
      }
    }
    // Sample from active first
    const sampled = [];
    const shuffledActive = activeIndices.sort(() => Math.random() - 0.5);
    sampled.push(...shuffledActive.slice(0, Math.min(MAX_RETINA_ASSOC_LINES * 0.7, shuffledActive.length)));
    const shuffledInactive = inactiveIndices.sort(() => Math.random() - 0.5);
    sampled.push(...shuffledInactive.slice(0, MAX_RETINA_ASSOC_LINES - sampled.length));

    const cols = 8;
    const dotSize = Math.min(
      (ASSOC_VIZ_W - 16) / cols,
      (ASSOC_VIZ_H - 16) / Math.ceil(NUM_ASSOCIATION / cols)
    );
    const padX = (ASSOC_VIZ_W - cols * dotSize) / 2;
    const padY = (ASSOC_VIZ_H - Math.ceil(NUM_ASSOCIATION / cols) * dotSize) / 2;
    const cellSize = RETINA_VIZ_SIZE / RETINA_SIZE;

    for (const aIdx of sampled) {
      const unit = associationUnits[aIdx];
      // Pick one random connection from this unit
      const pixelIdx = unit.connections[Math.floor(Math.random() * unit.connections.length)];
      const pixelRow = Math.floor(pixelIdx / RETINA_SIZE);
      const pixelCol = pixelIdx % RETINA_SIZE;

      const aRow = Math.floor(aIdx / cols);
      const aCol = aIdx % cols;

      const x1 = retinaPos.x + RETINA_VIZ_SIZE;
      const y1 = retinaPos.y + pixelRow * cellSize + cellSize / 2;
      const x2 = assocPos.x;
      const y2 = assocPos.y + padY + aRow * dotSize + dotSize / 2;

      const active = activations && activations[aIdx] > 0 && retina[pixelIdx] > 0;

      lines.push({ x1, y1, x2, y2, active, key: `ra-${aIdx}` });
    }
    return lines;
  }, [retina, associationUnits, activations, retinaPos, assocPos]);

  // Connections from association to output
  const assocToOutput = useMemo(() => {
    const lines = [];
    const cols = 8;
    const dotSize = Math.min(
      (ASSOC_VIZ_W - 16) / cols,
      (ASSOC_VIZ_H - 16) / Math.ceil(NUM_ASSOCIATION / cols)
    );
    const padY = (ASSOC_VIZ_H - Math.ceil(NUM_ASSOCIATION / cols) * dotSize) / 2;

    const unitH = 60;
    const gap = 30;
    const totalH = unitH * 2 + gap;
    const startY = (OUTPUT_VIZ_H - totalH) / 2;

    // Sample some association units
    const indices = Array.from({ length: NUM_ASSOCIATION }, (_, i) => i)
      .sort(() => Math.random() - 0.5)
      .slice(0, MAX_ASSOC_OUTPUT_LINES);

    for (const aIdx of indices) {
      const aRow = Math.floor(aIdx / cols);
      const x1 = assocPos.x + ASSOC_VIZ_W;
      const y1 = assocPos.y + padY + aRow * dotSize + dotSize / 2;

      for (let oIdx = 0; oIdx < 2; oIdx++) {
        const x2 = outputPos.x;
        const y2 = outputPos.y + startY + oIdx * (unitH + gap) + unitH / 2;

        const w = weights ? weights[oIdx][aIdx] : 0;
        const active = activations && activations[aIdx] > 0;

        lines.push({
          x1, y1, x2, y2,
          active,
          weight: w,
          key: `ao-${aIdx}-${oIdx}`,
        });
      }
    }
    return lines;
  }, [activations, weights, assocPos, outputPos]);

  return (
    <g>
      {/* Retina → Association connections */}
      {retinaToAssoc.map((line) => (
        <line
          key={line.key}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={line.active ? '#3b82f6' : '#d1d5db'}
          strokeWidth={line.active ? 1 : 0.4}
          opacity={line.active ? 0.6 : 0.15}
        />
      ))}
      {/* Association → Output connections */}
      {assocToOutput.map((line) => {
        const absW = Math.abs(line.weight);
        const color = line.weight > 0 ? '#22c55e' : line.weight < 0 ? '#ef4444' : '#d1d5db';
        return (
          <line
            key={line.key}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={line.active ? color : '#d1d5db'}
            strokeWidth={line.active ? Math.max(0.5, absW * 3) : 0.3}
            opacity={line.active ? Math.min(0.8, 0.2 + absW * 2) : 0.1}
          />
        );
      })}
    </g>
  );
}

export default function NetworkViz({
  retina,
  associationUnits,
  activations,
  weights,
  scores,
  labels,
  prediction,
}) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(900);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute positions based on available width
  const positions = useMemo(() => {
    const totalContentW = RETINA_VIZ_SIZE + ASSOC_VIZ_W + OUTPUT_VIZ_W + LAYER_GAP * 2;
    const startX = Math.max(20, (containerWidth - totalContentW) / 2);

    const retinaX = startX;
    const retinaY = TOP_PAD + (ASSOC_VIZ_H - RETINA_VIZ_SIZE) / 2;

    const assocX = retinaX + RETINA_VIZ_SIZE + LAYER_GAP;
    const assocY = TOP_PAD;

    const outputX = assocX + ASSOC_VIZ_W + LAYER_GAP;
    const outputY = TOP_PAD + (ASSOC_VIZ_H - OUTPUT_VIZ_H) / 2;

    return {
      retina: { x: retinaX, y: retinaY },
      assoc: { x: assocX, y: assocY },
      output: { x: outputX, y: outputY },
    };
  }, [containerWidth]);

  const svgH = TOP_PAD + ASSOC_VIZ_H + 40;

  return (
    <div ref={containerRef} className="w-full">
      <svg
        width="100%"
        height={svgH}
        viewBox={`0 0 ${containerWidth} ${svgH}`}
        className="overflow-visible"
      >
        {/* Connection lines (behind layers) */}
        <Connections
          retina={retina}
          associationUnits={associationUnits}
          activations={activations}
          weights={weights}
          scores={scores}
          prediction={prediction}
          retinaPos={positions.retina}
          assocPos={positions.assoc}
          outputPos={positions.output}
        />

        {/* Layers */}
        <RetinaLayer retina={retina} x={positions.retina.x} y={positions.retina.y} />
        <AssociationLayerViz activations={activations} x={positions.assoc.x} y={positions.assoc.y} />
        <OutputLayerViz
          scores={scores}
          labels={labels}
          prediction={prediction}
          x={positions.output.x}
          y={positions.output.y}
          weights={weights}
        />

        {/* Connection labels */}
        <text
          x={(positions.retina.x + RETINA_VIZ_SIZE + positions.assoc.x) / 2}
          y={TOP_PAD + ASSOC_VIZ_H + 24}
          textAnchor="middle"
          className="text-[10px]"
          fill="#9ca3af"
        >
          Fixed random connections
        </text>
        <text
          x={(positions.assoc.x + ASSOC_VIZ_W + positions.output.x) / 2}
          y={TOP_PAD + ASSOC_VIZ_H + 24}
          textAnchor="middle"
          className="text-[10px]"
          fill="#9ca3af"
        >
          Trainable weights
        </text>

        {/* Flow arrows */}
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="#9ca3af" />
          </marker>
        </defs>
        {/* Arrow under retina→assoc */}
        <line
          x1={positions.retina.x + RETINA_VIZ_SIZE + 10}
          y1={TOP_PAD + ASSOC_VIZ_H + 10}
          x2={positions.assoc.x - 10}
          y2={TOP_PAD + ASSOC_VIZ_H + 10}
          stroke="#9ca3af"
          strokeWidth={1}
          markerEnd="url(#arrowhead)"
        />
        {/* Arrow under assoc→output */}
        <line
          x1={positions.assoc.x + ASSOC_VIZ_W + 10}
          y1={TOP_PAD + ASSOC_VIZ_H + 10}
          x2={positions.output.x - 10}
          y2={TOP_PAD + ASSOC_VIZ_H + 10}
          stroke="#9ca3af"
          strokeWidth={1}
          markerEnd="url(#arrowhead)"
        />
      </svg>
    </div>
  );
}
