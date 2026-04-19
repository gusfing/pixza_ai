import { cn } from "@/lib/utils";

export const DashedBackground = ({ x = 0, y = 0, zoom = 1 }: { x?: number, y?: number, zoom?: number }) => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Cinematic Ambient Glows */}
      <div className="absolute inset-0 z-[-1] opacity-90 overflow-hidden">
        <div className="absolute top-[-20%] left-[-15%] w-[80%] h-[80%] bg-indigo-600/30 blur-[200px] rounded-full animate-pulse-slow mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[80%] h-[80%] bg-fuchsia-600/30 blur-[200px] rounded-full animate-pulse-slow mix-blend-screen" 
             style={{ animationDelay: '2s' }} />
        <div className="absolute top-[10%] right-[10%] w-[50%] h-[50%] bg-cyan-500/20 blur-[180px] rounded-full animate-float mix-blend-screen" />
        <div className="absolute bottom-[10%] left-[10%] w-[50%] h-[50%] bg-amber-500/10 blur-[180px] rounded-full animate-float mix-blend-screen" 
             style={{ animationDelay: '3s' }} />
      </div>

      <div
        className="absolute inset-[-5000px] z-0"
        style={{
          transform: `translate(${x}px, ${y}px) scale(${zoom})`,
          transformOrigin: '5000px 5000px',
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1.5px, transparent 1.5px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1.5px, transparent 1.5px)
          `,
          backgroundSize: "24px 24px",
          backgroundPosition: "0 0",
          maskImage: `
            repeating-linear-gradient(
              to right,
              black 0px,
              black 4px,
              transparent 4px,
              transparent 10px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 4px,
              transparent 4px,
              transparent 10px
            )
          `,
          WebkitMaskImage: `
            repeating-linear-gradient(
              to right,
              black 0px,
              black 4px,
              transparent 4px,
              transparent 10px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 4px,
              transparent 4px,
              transparent 10px
            )
          `,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />
    </div>
  );
};

export default DashedBackground;
