
import React, { useState, useEffect, useRef } from 'react';
import { FormulaDisplay } from './components/FormulaDisplay';
import { ZoomControl } from './components/ZoomControl';
import { ParameterControls } from './components/ParameterControls';
import { DataPanel } from './components/DataPanel';
import { CanvasVisualizer } from './components/CanvasVisualizer';
import { Manifesto } from './components/Manifesto';
import { BottomText } from './components/BottomText';
import { Point } from './types';

export default function App() {
  // Math State
  const [theta, setTheta] = useState(0);
  const [currentPoint, setCurrentPoint] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [orbitA, setOrbitA] = useState(0);
  const [orbitB, setOrbitB] = useState(100);
  
  // UI State
  const [isInteracting, setIsInteracting] = useState(false);

  // Audio Ref
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioStartedRef = useRef(false);

  // Physics Refs for Momentum/Inertia
  const velocityRef = useRef(0);
  const thetaRef = useRef(0);
  const lastTouchYRef = useRef(0);
  const requestRef = useRef<number | undefined>(undefined);
  const interactionTimerRef = useRef<number | undefined>(undefined);

  // Physics Loop (The "DJ Spin" Effect)
  const updatePhysics = () => {
    // Apply velocity to position
    if (Math.abs(velocityRef.current) > 0.00001) {
      thetaRef.current += velocityRef.current;
      if (thetaRef.current < 0) {
        thetaRef.current = 0;
        velocityRef.current = 0;
      }
      
      // Apply Friction (Decay)
      velocityRef.current *= 0.95; 
      
      // Update React State for rendering
      setTheta(thetaRef.current);
    }

    requestRef.current = requestAnimationFrame(updatePhysics);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updatePhysics);
    
    // Try to autoplay audio on load
    if (audioRef.current) {
        audioRef.current.volume = 0.5;
        audioRef.current.play().catch(() => {
            // Autoplay usually blocked, ignore error and wait for interaction
            console.log("Autoplay blocked, waiting for interaction");
        });
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Event Handlers
  useEffect(() => {
    const handleUserInteraction = () => {
      setIsInteracting(true);
      if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
      interactionTimerRef.current = window.setTimeout(() => setIsInteracting(false), 1000);

      // Try to start audio on first interaction if blocked initially
      if (!audioStartedRef.current && audioRef.current) {
          audioRef.current.play().then(() => {
              audioStartedRef.current = true;
          }).catch(() => {});
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault(); // STOP browser scroll
      handleUserInteraction();
      
      // Add to velocity instead of setting position directly
      const delta = e.deltaY * 0.0005; 
      velocityRef.current += delta;
    };

    const handleTouchStart = (e: TouchEvent) => {
      // Allow slider interaction
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT') return;

      lastTouchYRef.current = e.touches[0].clientY;
      // Stop current momentum on touch down for better control
      velocityRef.current = 0;
      
      handleUserInteraction();
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Allow slider interaction
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT') return;

      e.preventDefault(); // CRITICAL: Stops "pulling" / rubber-banding
      handleUserInteraction();

      const touchY = e.touches[0].clientY;
      const deltaY = lastTouchYRef.current - touchY;
      lastTouchYRef.current = touchY;

      // Add to velocity based on finger movement
      velocityRef.current += deltaY * 0.002;
    };

    // Add listeners to window/body to capture everything
    const target = window;
    
    // { passive: false } is required to use preventDefault()
    target.addEventListener('wheel', handleWheel, { passive: false });
    target.addEventListener('touchstart', handleTouchStart, { passive: false });
    target.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      target.removeEventListener('wheel', handleWheel);
      target.removeEventListener('touchstart', handleTouchStart);
      target.removeEventListener('touchmove', handleTouchMove);
      if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
    };
  }, []);

  const handleUpdate = (t: number, point: Point) => {
    setCurrentPoint(point);
  };

  return (
    // h-[100dvh] ensures it fits the dynamic viewport (address bars etc) on mobile
    // fixed inset-0 locks it in place so it cannot scroll naturally
    <div className="fixed inset-0 w-full h-[100dvh] bg-black text-white font-mono overflow-hidden select-none touch-none">
        
        {/* Background Audio */}
        <audio ref={audioRef} src="/background.mp3" loop />

        {/* Manifesto Background Layer */}
        <Manifesto theta={theta} />

        {/* Scroll-revealed Bottom Text */}
        <BottomText theta={theta} />

        {/* --- UI OVERLAYS (STICKY CORNERS) --- */}

        {/* Top Left Symbol */}
        <div className="absolute top-6 left-6 z-50 pointer-events-none mix-blend-difference">
            <div className="bg-black/0 backdrop-blur-none p-2 inline-block rounded">
                <div className="text-sm font-mono leading-tight tracking-tighter text-gray-200 opacity-80">
                    π
                </div>
            </div>
        </div>

        {/* Top Right Controls */}
        <div className="absolute top-6 right-6 z-50 flex flex-col items-end pointer-events-none gap-1">
            <FormulaDisplay orbitA={orbitA} orbitB={orbitB} />
            <div className="flex flex-col items-end">
                <ZoomControl zoom={zoom} onZoomChange={setZoom} />
                <ParameterControls 
                  orbitA={orbitA} 
                  orbitB={orbitB} 
                  onChangeA={setOrbitA} 
                  onChangeB={setOrbitB} 
                />
            </div>
        </div>

        {/* Bottom Right Data Panel */}
        <DataPanel theta={theta} point={currentPoint} />
        
        {/* Bottom Left Signature */}
        <div className="absolute bottom-8 left-8 z-50 text-gray-500 pointer-events-none mix-blend-difference">
            <div className="font-mono text-xs tracking-widest opacity-70">
                ▬▬ι═══════ﺤ
            </div>
            <div className="font-mono text-[10px] mt-1 tracking-widest uppercase opacity-50">
                ⌖ x neeko
            </div>
        </div>

        {/* Interaction Prompt - Hidden on Mobile, Visible on Desktop */}
        <div 
            className={`
                fixed z-40 transition-opacity duration-500 pointer-events-none 
                ${theta > 0.1 || isInteracting ? 'opacity-0' : 'opacity-100'}

                /* Mobile: Hidden */
                hidden

                /* Desktop: Visible and centered at bottom */
                md:block md:bottom-10 md:left-1/2 md:right-auto md:-translate-x-1/2 md:text-center md:w-auto
            `}
        >
            <div className="animate-pulse">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-600">Scroll to Reveal</span>
            </div>
        </div>

        {/* Main Visualization */}
        <main className="w-full h-full relative z-0">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" 
                style={{ 
                    backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', 
                    backgroundSize: '40px 40px' 
                }}>
            </div>
            
            <CanvasVisualizer 
                targetTheta={theta} 
                zoom={zoom}
                radiusA={orbitA / 100}
                radiusB={orbitB / 100}
                onUpdate={handleUpdate}
            />
        </main>
    </div>
  );
}
