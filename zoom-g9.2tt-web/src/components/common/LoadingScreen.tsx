import { useState, useEffect, useCallback } from 'react';

interface LoadingScreenProps {
  onLoadComplete: () => void;
  minDisplayTime?: number;
}

/** Animated sound wave bars */
function SoundWave() {
  return (
    <div className="flex items-end justify-center gap-1 h-12">
      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          className="w-1.5 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full"
          style={{
            animation: `soundwave 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`,
            height: '100%',
          }}
        />
      ))}
    </div>
  );
}

/** Pulsing ring effect */
function PulsingRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full border-2 border-blue-500/30"
          style={{
            width: `${100 + i * 50}%`,
            height: `${100 + i * 50}%`,
            animation: `pulse-ring 2.5s ease-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Floating particles in background */
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `rgba(${100 + Math.random() * 155}, ${100 + Math.random() * 155}, 255, ${0.1 + Math.random() * 0.3})`,
            animation: `float ${4 + Math.random() * 6}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Animated knob/dial */
function AnimatedKnob() {
  return (
    <div className="relative w-24 h-24 md:w-32 md:h-32">
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-4 border-neutral-700 shadow-lg" />

      {/* Gradient background */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-neutral-600 via-neutral-700 to-neutral-800 shadow-inner" />

      {/* Inner circle */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-neutral-500 to-neutral-700 shadow-md" />

      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg animate-pulse" />
      </div>

      {/* Rotating indicator line */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ animation: 'rotate-knob 3s ease-in-out infinite' }}
      >
        <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-transparent rounded-full transform -translate-y-4" />
      </div>

      {/* LED indicators around the knob */}
      {[...Array(8)].map((_, i) => {
        const angle = (i * 45 - 135) * (Math.PI / 180);
        const radius = 52;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `calc(50% + ${x}px - 4px)`,
              top: `calc(50% + ${y}px - 4px)`,
              background: i < 5 ? '#3b82f6' : '#374151',
              boxShadow: i < 5 ? '0 0 8px rgba(59, 130, 246, 0.8)' : 'none',
              animation: i < 5 ? `led-blink 1.5s ease-in-out infinite ${i * 0.15}s` : 'none',
            }}
          />
        );
      })}
    </div>
  );
}

export function LoadingScreen({ onLoadComplete, minDisplayTime = 1500 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Assets to preload
  const assetsToLoad = [
    '/zoom-g9-nobg.png',
    '/zoomlogo.png',
  ];

  // Preload assets
  const preloadAssets = useCallback(async () => {
    const totalAssets = assetsToLoad.length;
    let loadedCount = 0;

    const loadPromises = assetsToLoad.map((src) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          setProgress((loadedCount / totalAssets) * 100);
          resolve();
        };
        img.onerror = () => {
          loadedCount++;
          setProgress((loadedCount / totalAssets) * 100);
          resolve();
        };
        img.src = src;
      });
    });

    await Promise.all(loadPromises);
    setAssetsLoaded(true);
  }, []);

  // Start preloading and minimum time timer
  useEffect(() => {
    preloadAssets();

    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [preloadAssets, minDisplayTime]);

  // Trigger exit animation when both conditions are met
  useEffect(() => {
    if (assetsLoaded && minTimeElapsed && !isExiting) {
      setIsExiting(true);
      // Wait for exit animation to complete
      const exitTimer = setTimeout(() => {
        onLoadComplete();
      }, 600);
      return () => clearTimeout(exitTimer);
    }
  }, [assetsLoaded, minTimeElapsed, isExiting, onLoadComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-neutral-950 flex flex-col items-center justify-center transition-all duration-500 ease-out ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(30, 58, 138, 0.15) 0%, rgba(10, 10, 10, 1) 70%)',
        }}
      />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Main content */}
      <div className={`relative z-10 flex flex-col items-center transition-all duration-400 ${
        isExiting ? '-translate-y-4' : 'translate-y-0'
      }`}>

        {/* Animated knob with effects */}
        <div className="relative mb-8">
          <PulsingRings />
          <AnimatedKnob />
        </div>

        {/* Sound wave animation */}
        <div className="mb-6">
          <SoundWave />
        </div>

        {/* Loading text */}
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-wide">
          G9.2<span className="text-blue-500">tt</span> Editor
        </h2>

        {/* Progress bar */}
        <div className="w-48 md:w-64 h-1.5 bg-neutral-800 rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s linear infinite',
            }}
          />
        </div>

        {/* Loading status */}
        <p className="text-neutral-500 text-sm">
          {progress < 100 ? 'Loading...' : 'Ready'}
        </p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes soundwave {
          0%, 100% {
            transform: scaleY(0.2);
          }
          50% {
            transform: scaleY(1);
          }
        }

        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.2;
          }
          25% {
            transform: translateY(-30px) translateX(15px);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-15px) translateX(-15px);
            opacity: 0.3;
          }
          75% {
            transform: translateY(-40px) translateX(8px);
            opacity: 0.5;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @keyframes rotate-knob {
          0%, 100% {
            transform: rotate(-45deg);
          }
          50% {
            transform: rotate(45deg);
          }
        }

        @keyframes led-blink {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 8px rgba(59, 130, 246, 0.8);
          }
          50% {
            opacity: 0.6;
            box-shadow: 0 0 4px rgba(59, 130, 246, 0.4);
          }
        }
      `}</style>
    </div>
  );
}
