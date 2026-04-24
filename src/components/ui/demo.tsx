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

// Canvas dashed background grid — used by WorkflowCanvas
export function DashedBackground({ x = 0, y = 0, zoom = 1 }: { x?: number; y?: number; zoom?: number }) {
  const size = 24 * zoom;
  const offsetX = x % size;
  const offsetY = y % size;
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <defs>
        <pattern
          id="dashed-grid"
          x={offsetX}
          y={offsetY}
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={0} cy={0} r={0.8} fill="rgba(255,255,255,0.12)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dashed-grid)" />
    </svg>
  );
}
