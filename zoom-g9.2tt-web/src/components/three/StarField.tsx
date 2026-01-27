import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Create circular star texture
function createStarTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.4)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const starTexture = createStarTexture();

// Static stars background
function Stars({ count = 5000, radius = 100, speed = 0.0001, size = 0.15, color = '#ffffff' }: {
  count?: number;
  radius?: number;
  speed?: number;
  size?: number;
  color?: string;
}) {
  const meshRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const baseColor = new THREE.Color(color);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * Math.cbrt(Math.random());

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const variation = 0.8 + Math.random() * 0.4;
      colors[i * 3] = baseColor.r * variation;
      colors[i * 3 + 1] = baseColor.g * variation;
      colors[i * 3 + 2] = baseColor.b * variation;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [count, radius, color]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += speed;
      meshRef.current.rotation.x += speed * 0.3;
    }
  });

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        size={size}
        map={starTexture}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Single shooting star with trail using points
function ShootingStar({ onComplete }: { onComplete: () => void }) {
  const pointsRef = useRef<THREE.Points>(null);
  const progressRef = useRef(0);
  const trailLength = 25;

  const config = useMemo(() => {
    const startX = (Math.random() - 0.5) * 60;
    const startY = 15 + Math.random() * 25;
    const startZ = (Math.random() - 0.5) * 30 - 15;

    const dirX = (Math.random() - 0.5) * 1.5;
    const dirY = -1 - Math.random() * 0.3;
    const dirZ = (Math.random() - 0.5) * 0.3;

    return {
      start: new THREE.Vector3(startX, startY, startZ),
      direction: new THREE.Vector3(dirX, dirY, dirZ).normalize(),
      length: THREE.MathUtils.randFloat(20, 40),
      speed: THREE.MathUtils.randFloat(0.012, 0.022),
    };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(trailLength * 3);
    const colors = new Float32Array(trailLength * 3);
    const sizes = new Float32Array(trailLength);

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    return geo;
  }, []);

  useFrame(() => {
    progressRef.current += config.speed;

    const posAttr = geometry.getAttribute('position');
    const colorAttr = geometry.getAttribute('color');
    const sizeAttr = geometry.getAttribute('size');

    if (!posAttr || !colorAttr || !sizeAttr) return;

    const positions = posAttr.array as Float32Array;
    const colors = colorAttr.array as Float32Array;
    const sizes = sizeAttr.array as Float32Array;

    for (let i = 0; i < trailLength; i++) {
      const t = progressRef.current - i * 0.025;
      const pos = config.start.clone().addScaledVector(config.direction, t * config.length);

      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;

      // Fade effect
      const fadeIn = Math.min(1, progressRef.current * 4);
      const fadeOut = Math.max(0, 1 - (progressRef.current - 1) * 2.5);
      const trailFade = Math.max(0, 1 - i / trailLength);
      const alpha = trailFade * fadeIn * fadeOut;

      colors[i * 3] = 1;
      colors[i * 3 + 1] = 1;
      colors[i * 3 + 2] = 0.9 + 0.1 * trailFade;

      sizes[i] = (0.6 - i * 0.02) * alpha;
    }

    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;

    if (progressRef.current > 1.4) {
      onComplete();
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.5}
        map={starTexture}
        vertexColors
        transparent
        opacity={1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Shooting star spawner
function ShootingStars() {
  const [stars, setStars] = useState<number[]>([]);
  const nextIdRef = useRef(0);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const spawnStar = () => {
      setStars(prev => [...prev, nextIdRef.current++]);
      const nextInterval = 2500 + Math.random() * 4500;
      timeoutId = setTimeout(spawnStar, nextInterval);
    };

    timeoutId = setTimeout(spawnStar, 1500 + Math.random() * 2000);

    return () => clearTimeout(timeoutId);
  }, []);

  const removeStar = (id: number) => {
    setStars(prev => prev.filter(starId => starId !== id));
  };

  return (
    <>
      {stars.map(id => (
        <ShootingStar key={id} onComplete={() => removeStar(id)} />
      ))}
    </>
  );
}

// Camera movement
function CameraRig() {
  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime();
    camera.position.x = Math.sin(t * 0.02) * 2;
    camera.position.y = Math.cos(t * 0.015) * 2;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export function StarField() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        background: '#000'
      }}
    >
      <Canvas camera={{ position: [0, 0, 30], fov: 75 }}>
        {/* Static star layers */}
        <Stars count={500} radius={40} speed={0.00015} size={0.4} color="#ffffff" />
        <Stars count={1500} radius={80} speed={0.0001} size={0.25} color="#ffffff" />
        <Stars count={3000} radius={120} speed={0.00005} size={0.15} color="#aaccff" />
        <Stars count={5000} radius={180} speed={0.00003} size={0.08} color="#8899dd" />

        {/* Shooting stars */}
        <ShootingStars />

        <CameraRig />
      </Canvas>
    </div>
  );
}
