import { useMemo, useRef, useEffect, useState } from 'react';
import { RETINA_SIZE, NUM_ASSOCIATION } from '../perceptron';

// Layout constants
const LAYER_GAP = 120;
const RETINA_VIZ_SIZE = 200;
const ASSOC_VIZ_W = 120;
const ASSOC_VIZ_H = 320;
const WEIGHT_VIZ_W = 80;
const WEIGHT_VIZ_H = 320;
const OUTPUT_VIZ_H = 200;
const OUTPUT_VIZ_W = 90;
const TOP_PAD = 60;
const BORDER = 3;

const MAX_RETINA_ASSOC_LINES = 80;
const MAX_ASSOC_OUTPUT_LINES = 40;

const INACTIVE_COLOR = '#b8b0a0';
const INACTIVE_DOT = '#c8c0b4';
const DARK = '#1a1a1a';

// Layer panel colors
const RETINA_BG = '#bdd7f5';
const ASSOC_BG = '#c8e6c0';
const WEIGHT_BG = '#f5e6a3';
const OUTPUT_BG = '#f5c4b8';

function weightToSvgColor(w) {
  if (w > 0) {
    const intensity = Math.min(w * 3, 1);
    const g = Math.round(100 + 155 * intensity);
    return `rgb(60, ${g}, 60)`;
  } else if (w < 0) {
    const intensity = Math.min(-w * 3, 1);
    const r = Math.round(100 + 155 * intensity);
    return `rgb(${r}, 60, 60)`;
  }
  return '#c8c0b4';
}

function RetinaLayer({ retina, x, y }) {
  const cellSize = RETINA_VIZ_SIZE / RETINA_SIZE;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        width={RETINA_VIZ_SIZE}
        height={RETINA_VIZ_SIZE}
        rx={18}
        fill={RETINA_BG}
        stroke={DARK}
        strokeWidth={BORDER}
      />
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
            fill={val ? DARK : '#e8e3db'}
            rx={1}
          />
        );
      })}
      <text
        x={RETINA_VIZ_SIZE / 2}
        y={-14}
        textAnchor="middle"
        fontFamily="'Space Mono', monospace"
        fontSize={11}
        fontWeight={700}
        fill={DARK}
      >
        RETINA 20x20
      </text>
    </g>
  );
}

function AssociationLayerViz({ activations, x, y }) {
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
        rx={18}
        fill={ASSOC_BG}
        stroke={DARK}
        strokeWidth={BORDER}
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
            fill={active ? '#3b82f6' : INACTIVE_DOT}
            stroke={active ? DARK : 'none'}
            strokeWidth={active ? 0.5 : 0}
          />
        );
      })}
      <text
        x={ASSOC_VIZ_W / 2}
        y={-14}
        textAnchor="middle"
        fontFamily="'Space Mono', monospace"
        fontSize={11}
        fontWeight={700}
        fill={DARK}
      >
        ASSOCIATION
      </text>
      <text
        x={ASSOC_VIZ_W / 2}
        y={ASSOC_VIZ_H + 18}
        textAnchor="middle"
        fontFamily="'Space Mono', monospace"
        fontSize={10}
        fill={DARK}
        opacity={0.5}
      >
        {numActive}/512 active
      </text>
    </g>
  );
}

function WeightLayerViz({ weights, labels, x, y }) {
  const cols = 16;
  const rows = Math.ceil(NUM_ASSOCIATION / cols);
  const cellSize = Math.min(
    (WEIGHT_VIZ_W - 8) / cols,
    ((WEIGHT_VIZ_H - 40) / 2) / rows
  );
  const gridH = rows * cellSize;
  const totalH = gridH * 2 + 24;
  const startY = (WEIGHT_VIZ_H - totalH) / 2;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        width={WEIGHT_VIZ_W}
        height={WEIGHT_VIZ_H}
        rx={18}
        fill={WEIGHT_BG}
        stroke={DARK}
        strokeWidth={BORDER}
      />
      {[0, 1].map((oIdx) => {
        const gy = startY + oIdx * (gridH + 24);
        const padX = (WEIGHT_VIZ_W - cols * cellSize) / 2;
        return (
          <g key={oIdx} transform={`translate(0, ${gy})`}>
            <text
              x={WEIGHT_VIZ_W / 2}
              y={-3}
              textAnchor="middle"
              fontFamily="'Space Mono', monospace"
              fontSize={8}
              fontWeight={700}
              fill={DARK}
            >
              {labels[oIdx]}
            </text>
            {weights && Array.from({ length: NUM_ASSOCIATION }, (_, i) => {
              const row = Math.floor(i / cols);
              const col = i % cols;
              return (
                <rect
                  key={i}
                  x={padX + col * cellSize}
                  y={row * cellSize}
                  width={cellSize - 0.5}
                  height={cellSize - 0.5}
                  fill={weightToSvgColor(weights[oIdx][i])}
                  rx={0.5}
                />
              );
            })}
          </g>
        );
      })}
      <text
        x={WEIGHT_VIZ_W / 2}
        y={-14}
        textAnchor="middle"
        fontFamily="'Space Mono', monospace"
        fontSize={11}
        fontWeight={700}
        fill={DARK}
      >
        WEIGHTS
      </text>
    </g>
  );
}

function OutputLayerViz({ scores, labels, prediction, x, y }) {
  const unitH = 70;
  const unitW = OUTPUT_VIZ_W;
  const gap = 20;
  const totalH = unitH * 2 + gap;
  const startY = (OUTPUT_VIZ_H - totalH) / 2;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        width={OUTPUT_VIZ_W}
        height={OUTPUT_VIZ_H}
        rx={18}
        fill={OUTPUT_BG}
        stroke={DARK}
        strokeWidth={BORDER}
      />
      {[0, 1].map((idx) => {
        const isWinner = prediction === idx;
        return (
          <g key={idx} transform={`translate(0, ${startY + idx * (unitH + gap)})`}>
            <rect
              x={10}
              y={0}
              width={unitW - 20}
              height={unitH}
              rx={unitH / 2}
              fill={isWinner ? DARK : 'rgba(255,255,255,0.6)'}
              stroke={DARK}
              strokeWidth={2.5}
            />
            <text
              x={unitW / 2}
              y={26}
              textAnchor="middle"
              fontFamily="'Space Grotesk', sans-serif"
              fontSize={11}
              fontWeight={700}
              fill={isWinner ? '#fff' : DARK}
            >
              {labels[idx]}
            </text>
            <text
              x={unitW / 2}
              y={46}
              textAnchor="middle"
              fontFamily="'Space Mono', monospace"
              fontSize={13}
              fontWeight={700}
              fill={isWinner ? '#fff' : DARK}
            >
              {scores ? scores[idx].toFixed(2) : '—'}
            </text>
            {isWinner && (
              <text
                x={unitW / 2}
                y={60}
                textAnchor="middle"
                fontFamily="'Space Mono', monospace"
                fontSize={7}
                fontWeight={700}
                fill="#ef4444"
              >
                PREDICTED
              </text>
            )}
          </g>
        );
      })}
      <text
        x={OUTPUT_VIZ_W / 2}
        y={-14}
        textAnchor="middle"
        fontFamily="'Space Mono', monospace"
        fontSize={11}
        fontWeight={700}
        fill={DARK}
      >
        OUTPUT
      </text>
    </g>
  );
}

function Connections({
  retina,
  associationUnits,
  activations,
  weights,
  retinaPos,
  assocPos,
  weightPos,
  outputPos,
}) {
  const retinaToAssoc = useMemo(() => {
    const lines = [];
    const activeIndices = [];
    const inactiveIndices = [];
    for (let i = 0; i < NUM_ASSOCIATION; i++) {
      if (activations && activations[i] > 0) activeIndices.push(i);
      else inactiveIndices.push(i);
    }
    const sampled = [];
    const shuffledActive = activeIndices.sort(() => Math.random() - 0.5);
    sampled.push(...shuffledActive.slice(0, Math.min(MAX_RETINA_ASSOC_LINES * 0.7, shuffledActive.length)));
    const shuffledInactive = inactiveIndices.sort(() => Math.random() - 0.5);
    sampled.push(...shuffledInactive.slice(0, MAX_RETINA_ASSOC_LINES - sampled.length));

    const cols = 8;
    const dotSize = Math.min((ASSOC_VIZ_W - 16) / cols, (ASSOC_VIZ_H - 16) / Math.ceil(NUM_ASSOCIATION / cols));
    const padY = (ASSOC_VIZ_H - Math.ceil(NUM_ASSOCIATION / cols) * dotSize) / 2;
    const cellSize = RETINA_VIZ_SIZE / RETINA_SIZE;

    for (const aIdx of sampled) {
      const unit = associationUnits[aIdx];
      const pixelIdx = unit.connections[Math.floor(Math.random() * unit.connections.length)];
      const pixelRow = Math.floor(pixelIdx / RETINA_SIZE);
      const aRow = Math.floor(aIdx / cols);

      lines.push({
        x1: retinaPos.x + RETINA_VIZ_SIZE,
        y1: retinaPos.y + pixelRow * cellSize + cellSize / 2,
        x2: assocPos.x,
        y2: assocPos.y + padY + aRow * dotSize + dotSize / 2,
        active: activations && activations[aIdx] > 0 && retina[pixelIdx] > 0,
        key: `ra-${aIdx}`,
      });
    }
    return lines;
  }, [retina, associationUnits, activations, retinaPos, assocPos]);

  const assocToOutput = useMemo(() => {
    const lines = [];
    const cols = 8;
    const dotSize = Math.min((ASSOC_VIZ_W - 16) / cols, (ASSOC_VIZ_H - 16) / Math.ceil(NUM_ASSOCIATION / cols));
    const padY = (ASSOC_VIZ_H - Math.ceil(NUM_ASSOCIATION / cols) * dotSize) / 2;
    const unitH = 70, gap = 20;
    const totalH = unitH * 2 + gap;
    const startY = (OUTPUT_VIZ_H - totalH) / 2;

    const indices = Array.from({ length: NUM_ASSOCIATION }, (_, i) => i)
      .sort(() => Math.random() - 0.5).slice(0, MAX_ASSOC_OUTPUT_LINES);

    for (const aIdx of indices) {
      const aRow = Math.floor(aIdx / cols);
      const x1 = assocPos.x + ASSOC_VIZ_W;
      const y1 = assocPos.y + padY + aRow * dotSize + dotSize / 2;
      const xMid = weightPos.x + WEIGHT_VIZ_W / 2;

      for (let oIdx = 0; oIdx < 2; oIdx++) {
        lines.push({
          x1, y1,
          x2: outputPos.x,
          y2: outputPos.y + startY + oIdx * (unitH + gap) + unitH / 2,
          xMid, yMid: y1,
          active: activations && activations[aIdx] > 0,
          weight: weights ? weights[oIdx][aIdx] : 0,
          key: `ao-${aIdx}-${oIdx}`,
        });
      }
    }
    return lines;
  }, [activations, weights, assocPos, weightPos, outputPos]);

  return (
    <g>
      {retinaToAssoc.map((line) => (
        <line
          key={line.key}
          x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
          stroke={line.active ? DARK : INACTIVE_COLOR}
          strokeWidth={line.active ? 1.5 : 0.4}
          opacity={line.active ? 0.5 : 0.2}
        />
      ))}
      {assocToOutput.map((line) => {
        const absW = Math.abs(line.weight);
        const color = line.weight > 0 ? '#22c55e' : line.weight < 0 ? '#ef4444' : INACTIVE_COLOR;
        const isActive = line.active;
        return (
          <g key={line.key}>
            <line
              x1={line.x1} y1={line.y1} x2={line.xMid} y2={line.yMid}
              stroke={isActive ? color : INACTIVE_COLOR}
              strokeWidth={isActive ? Math.max(0.5, absW * 3) : 0.3}
              opacity={isActive ? Math.min(0.8, 0.2 + absW * 2) : 0.12}
            />
            <line
              x1={line.xMid} y1={line.yMid} x2={line.x2} y2={line.y2}
              stroke={isActive ? color : INACTIVE_COLOR}
              strokeWidth={isActive ? Math.max(0.5, absW * 3) : 0.3}
              opacity={isActive ? Math.min(0.8, 0.2 + absW * 2) : 0.12}
            />
          </g>
        );
      })}
    </g>
  );
}

export default function NetworkViz({ retina, associationUnits, activations, weights, scores, labels, prediction }) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(900);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => setContainerWidth(entries[0].contentRect.width));
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const positions = useMemo(() => {
    const totalContentW = RETINA_VIZ_SIZE + ASSOC_VIZ_W + WEIGHT_VIZ_W + OUTPUT_VIZ_W + LAYER_GAP * 3;
    const startX = Math.max(20, (containerWidth - totalContentW) / 2);
    return {
      retina: { x: startX, y: TOP_PAD + (ASSOC_VIZ_H - RETINA_VIZ_SIZE) / 2 },
      assoc: { x: startX + RETINA_VIZ_SIZE + LAYER_GAP, y: TOP_PAD },
      weight: { x: startX + RETINA_VIZ_SIZE + ASSOC_VIZ_W + LAYER_GAP * 2, y: TOP_PAD },
      output: { x: startX + RETINA_VIZ_SIZE + ASSOC_VIZ_W + WEIGHT_VIZ_W + LAYER_GAP * 3, y: TOP_PAD + (ASSOC_VIZ_H - OUTPUT_VIZ_H) / 2 },
    };
  }, [containerWidth]);

  const svgH = TOP_PAD + ASSOC_VIZ_H + 44;

  return (
    <div ref={containerRef} className="w-full">
      <svg width="100%" height={svgH} viewBox={`0 0 ${containerWidth} ${svgH}`} className="overflow-visible">
        <Connections
          retina={retina} associationUnits={associationUnits} activations={activations} weights={weights}
          retinaPos={positions.retina} assocPos={positions.assoc} weightPos={positions.weight} outputPos={positions.output}
        />
        <RetinaLayer retina={retina} x={positions.retina.x} y={positions.retina.y} />
        <AssociationLayerViz activations={activations} x={positions.assoc.x} y={positions.assoc.y} />
        <WeightLayerViz weights={weights} labels={labels} x={positions.weight.x} y={positions.weight.y} />
        <OutputLayerViz scores={scores} labels={labels} prediction={prediction} x={positions.output.x} y={positions.output.y} />

        {/* Arrows and labels */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <path d="M0,0 L10,3.5 L0,7" fill={DARK} />
          </marker>
        </defs>
        <line
          x1={positions.retina.x + RETINA_VIZ_SIZE + 12} y1={TOP_PAD + ASSOC_VIZ_H + 14}
          x2={positions.assoc.x - 12} y2={TOP_PAD + ASSOC_VIZ_H + 14}
          stroke={DARK} strokeWidth={2} markerEnd="url(#arrowhead)"
        />
        <text
          x={(positions.retina.x + RETINA_VIZ_SIZE + positions.assoc.x) / 2}
          y={TOP_PAD + ASSOC_VIZ_H + 32}
          textAnchor="middle"
          fontFamily="'Space Mono', monospace" fontSize={9} fill={DARK} opacity={0.4}
        >
          Fixed random
        </text>
        <line
          x1={positions.assoc.x + ASSOC_VIZ_W + 12} y1={TOP_PAD + ASSOC_VIZ_H + 14}
          x2={positions.output.x - 12} y2={TOP_PAD + ASSOC_VIZ_H + 14}
          stroke={DARK} strokeWidth={2} markerEnd="url(#arrowhead)"
        />
        <text
          x={(positions.assoc.x + ASSOC_VIZ_W + positions.output.x + OUTPUT_VIZ_W) / 2}
          y={TOP_PAD + ASSOC_VIZ_H + 32}
          textAnchor="middle"
          fontFamily="'Space Mono', monospace" fontSize={9} fill={DARK} opacity={0.4}
        >
          Trainable weights
        </text>
      </svg>
    </div>
  );
}
