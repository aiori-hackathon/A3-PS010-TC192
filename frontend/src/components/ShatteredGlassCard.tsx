import React, { useState, useRef, useEffect } from 'react';
import { useGlass } from './ShatteredGlassEngine';
import { Sparkles, Layers, RefreshCw } from 'lucide-react';

interface ShatteredGlassCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  badgeText?: string;
  className?: string;
}

export const ShatteredGlassCard: React.FC<ShatteredGlassCardProps> = ({
  children,
  title,
  subtitle,
  badgeText = "3D Smoked Crystal Interface",
  className = "",
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const { triggerShatter, isShattered, webGlSupported } = useGlass();

  // 3D Parallax Tilt state
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [shatterPulse, setShatterPulse] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (-12deg to +12deg)
    const newRotY = ((x - centerX) / centerX) * 8;
    const newRotX = -((y - centerY) / centerY) * 8;

    setRotX(newRotX);
    setRotY(newRotY);

    // Glare position in percentages
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlarePos({ x: glareX, y: glareY, opacity: 0.28 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotX(0);
    setRotY(0);
    setGlarePos(prev => ({ ...prev, opacity: 0 }));
  };

  const handleShatterClick = () => {
    setShatterPulse(true);
    triggerShatter();
    setTimeout(() => setShatterPulse(false), 900);
  };

  return (
    <div className={`relative perspective-1200 w-full max-w-md mx-auto ${className}`}>
      {/* =========================================================================
          3D FLOATING BACKGROUND CRYSTAL SHARDS (Outside the main container)
          ========================================================================= */}
      {/* Floating Shard 1: Top-Left angled crystal triangle */}
      <div
        className="absolute -top-12 -left-12 w-28 h-28 pointer-events-none transition-transform duration-500 ease-out hidden sm:block z-0 animate-float-shard-1"
        style={{
          transform: `translate3d(${rotY * -2.2}px, ${rotX * 2.2}px, 60px) rotate(-18deg)`,
        }}
      >
        <div
          className="w-full h-full prismatic-shard rounded-xl"
          style={{
            clipPath: 'polygon(15% 0%, 100% 25%, 85% 100%, 0% 80%)',
            background: 'linear-gradient(135deg, rgba(140, 123, 255, 0.18) 0%, rgba(23, 23, 27, 0.75) 100%)',
          }}
        />
      </div>

      {/* Floating Shard 2: Top-Right sharp geometric prism */}
      <div
        className="absolute -top-10 -right-10 w-24 h-24 pointer-events-none transition-transform duration-500 ease-out hidden sm:block z-0 animate-float-shard-2"
        style={{
          transform: `translate3d(${rotY * 2.5}px, ${rotX * -2.5}px, 45px) rotate(24deg)`,
        }}
      >
        <div
          className="w-full h-full prismatic-shard rounded-xl"
          style={{
            clipPath: 'polygon(30% 0%, 100% 0%, 75% 100%, 0% 65%)',
            background: 'linear-gradient(225deg, rgba(112, 215, 255, 0.22) 0%, rgba(23, 23, 27, 0.8) 100%)',
          }}
        />
      </div>

      {/* Floating Shard 3: Bottom-Left elongated crystal shard */}
      <div
        className="absolute -bottom-12 -left-10 w-32 h-20 pointer-events-none transition-transform duration-500 ease-out hidden sm:block z-0 animate-float-shard-3"
        style={{
          transform: `translate3d(${rotY * -1.8}px, ${rotX * -1.8}px, 50px) rotate(12deg)`,
        }}
      >
        <div
          className="w-full h-full prismatic-shard rounded-xl"
          style={{
            clipPath: 'polygon(0% 20%, 90% 0%, 100% 70%, 15% 100%)',
            background: 'linear-gradient(45deg, rgba(140, 123, 255, 0.15) 0%, rgba(23, 23, 27, 0.85) 100%)',
          }}
        />
      </div>

      {/* Floating Shard 4: Bottom-Right diamond crystal */}
      <div
        className="absolute -bottom-10 -right-8 w-24 h-28 pointer-events-none transition-transform duration-500 ease-out hidden sm:block z-0 animate-float-shard-1"
        style={{
          transform: `translate3d(${rotY * 2.0}px, ${rotX * 2.0}px, 35px) rotate(-15deg)`,
        }}
      >
        <div
          className="w-full h-full prismatic-shard rounded-xl"
          style={{
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            background: 'linear-gradient(315deg, rgba(112, 215, 255, 0.16) 0%, rgba(23, 23, 27, 0.8) 100%)',
          }}
        />
      </div>

      {/* =========================================================================
          MAIN 3D SHATTERED GLASS CONTAINER (Preserves 3D & Rotates)
          ========================================================================= */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative z-10 preserve-3d transition-transform duration-200 ease-out rounded-3xl ${
          shatterPulse ? 'scale-95 duration-150' : ''
        }`}
        style={{
          transform: isHovered
            ? `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(15px)`
            : 'rotateX(0deg) rotateY(0deg) translateZ(0px)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Smoked 3D Glass Shell */}
        <div className="relative rounded-3xl overflow-hidden backdrop-blur-3xl bg-[#141418]/85 border border-white/[0.16] shadow-[0_30px_70px_0_rgba(0,0,0,0.8),inset_0_1px_3px_0_rgba(255,255,255,0.25)] hover:border-[#8C7BFF]/50 transition-colors duration-300">
          
          {/* Prismatic Specular Glare (tracks mouse) */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-30"
            style={{
              background: `radial-gradient(circle 350px at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.25) 0%, rgba(140,123,255,0.12) 30%, transparent 70%)`,
              opacity: glarePos.opacity,
            }}
          />

          {/* Crystalline Glass Gleam Streak (animated) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-25">
            <div className="w-1/2 h-[200%] -top-1/2 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent animate-glass-gleam pointer-events-none" />
          </div>

          {/* Fractured Glass Seams (Geometric Hairline Cracks) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-40 z-20 mix-blend-screen"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Crack line 1 */}
            <path
              d="M 0,90 L 120,130 L 170,110 L 290,160 L 450,140"
              stroke="rgba(255, 255, 255, 0.35)"
              strokeWidth="0.8"
              fill="none"
              strokeDasharray="4 2"
            />
            {/* Crack line 2 */}
            <path
              d="M 170,110 L 210,240 L 290,290 L 320,440"
              stroke="rgba(140, 123, 255, 0.45)"
              strokeWidth="0.8"
              fill="none"
            />
            {/* Crack line 3 */}
            <path
              d="M 210,240 L 90,320 L 0,350"
              stroke="rgba(112, 215, 255, 0.35)"
              strokeWidth="0.75"
              fill="none"
            />
            {/* Crack line 4 */}
            <path
              d="M 290,290 L 420,340 L 480,410"
              stroke="rgba(255, 255, 255, 0.25)"
              strokeWidth="0.75"
              fill="none"
            />
          </svg>

          {/* Card Header Shard Ribbon */}
          <div className="p-6 sm:p-8 relative z-30">
            {/* Top Interactive Glass Control Bar */}
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/[0.08]">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.12] text-[11px] font-mono text-[#B9ABFF]">
                <Layers className="w-3.5 h-3.5 text-[#8C7BFF]" />
                <span>{badgeText}</span>
              </div>

              {/* Interactive 3D Shatter Trigger */}
              <button
                type="button"
                onClick={handleShatterClick}
                title="Trigger 3D Shatter Physics"
                className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8C7BFF]/15 hover:bg-[#8C7BFF]/30 border border-[#8C7BFF]/40 text-[11px] font-mono text-[#E5E5EA] transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(140,123,255,0.25)]"
              >
                <Sparkles className="w-3 h-3 text-[#70D7FF] group-hover:rotate-45 transition-transform duration-300" />
                <span className="text-[10px] uppercase tracking-wider font-semibold">
                  {isShattered ? 'Assemble Glass' : 'Shatter 3D'}
                </span>
                <RefreshCw className={`w-2.5 h-2.5 text-[#A0A0AA] ${shatterPulse ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-1 text-xs text-[#A0A0AA] leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Inner Content Slot */}
            <div className="relative z-30">
              {children}
            </div>
          </div>

          {/* 3D Glass Bottom Bevel Line */}
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#8C7BFF]/40 to-transparent" />
        </div>
      </div>
    </div>
  );
};
