import React from 'react';
import { Header } from "@/components/ui/header-2";

export default function Demo() {
	return (
		<div className="w-full">
			<Header />

			<main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-12">
				<div  className="space-y-2 mb-4">
					<div className="bg-accent h-6 w-4/6 rounded-md border" />
					<div className="bg-accent h-6 w-1/2 rounded-md border" />
				</div>
				<div  className="flex gap-2 mb-8">
					<div className="bg-accent h-3 w-14 rounded-md border" />
					<div className="bg-accent h-3 w-12 rounded-md border" />
				</div>

				{Array.from({ length: 7 }).map((_, i) => (
					<div key={i} className="space-y-2 mb-8">
						<div className="bg-accent h-4 w-full rounded-md border" />
						<div className="bg-accent h-4 w-full rounded-md border" />
						<div className="bg-accent h-4 w-full rounded-md border" />
						<div className="bg-accent h-4 w-1/2 rounded-md border" />
					</div>
				))}
			</main>
		</div>
	);
}

// Canvas grid background — used by WorkflowCanvas
// Mimics the minimal grid canvas style (like Mixboard/Figma)
export function DashedBackground({ x = 0, y = 0, zoom = 1 }: { x?: number; y?: number; zoom?: number }) {
  // Cell size scales with zoom so grid moves naturally with pan/zoom
  const cellSize = 32 * zoom;
  const offsetX = ((x % cellSize) + cellSize) % cellSize;
  const offsetY = ((y % cellSize) + cellSize) % cellSize;

  // Sub-grid: every 4 cells draw a slightly brighter line
  const subSize = cellSize * 4;
  const subOffsetX = ((x % subSize) + subSize) % subSize;
  const subOffsetY = ((y % subSize) + subSize) % subSize;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Fine grid lines */}
        <pattern
          id="grid-fine"
          x={offsetX}
          y={offsetY}
          width={cellSize}
          height={cellSize}
          patternUnits="userSpaceOnUse"
        >
          {/* Vertical line */}
          <line
            x1={0} y1={0} x2={0} y2={cellSize}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="0.5"
          />
          {/* Horizontal line */}
          <line
            x1={0} y1={0} x2={cellSize} y2={0}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="0.5"
          />
        </pattern>

        {/* Major grid lines — every 4 cells */}
        <pattern
          id="grid-major"
          x={subOffsetX}
          y={subOffsetY}
          width={subSize}
          height={subSize}
          patternUnits="userSpaceOnUse"
        >
          <line
            x1={0} y1={0} x2={0} y2={subSize}
            stroke="rgba(255,255,255,0.09)"
            strokeWidth="0.75"
          />
          <line
            x1={0} y1={0} x2={subSize} y2={0}
            stroke="rgba(255,255,255,0.09)"
            strokeWidth="0.75"
          />
        </pattern>
      </defs>

      {/* Fill with fine grid first, then overlay major grid */}
      <rect width="100%" height="100%" fill="url(#grid-fine)" />
      <rect width="100%" height="100%" fill="url(#grid-major)" />
    </svg>
  );
}
