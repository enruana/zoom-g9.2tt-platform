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

  /* eslint-disable react-hooks/purity -- Math.random is intentional for generating stable random star positions */
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
  /* eslint-enable react-hooks/purity */

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

// Complete shooting star with trail and head glow
function ShootingStarComplete({ onComplete }: { onComplete: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(0);
  const segmentCount = 64;
  const [headPos, setHeadPos] = useState(new THREE.Vector3());
  const [headOpacity, setHeadOpacity] = useState(0);

  /* eslint-disable react-hooks/purity -- Math.random is intentional for unique shooting star trajectories */
  const config = useMemo(() => {
    const startX = (Math.random() - 0.5) * 50;
    const startY = 12 + Math.random() * 25;
    const startZ = (Math.random() - 0.5) * 20 - 10;

    const angle = -Math.PI / 4 + (Math.random() - 0.5) * 0.6;
    const dirX = Math.cos(angle) * (Math.random() > 0.5 ? 1 : -1);
    const dirY = Math.sin(angle) - 0.6;
    const dirZ = (Math.random() - 0.5) * 0.15;

    return {
      start: new THREE.Vector3(startX, startY, startZ),
      direction: new THREE.Vector3(dirX, dirY, dirZ).normalize(),
      length: THREE.MathUtils.randFloat(12, 22),
      speed: THREE.MathUtils.randFloat(0.01, 0.018),
      width: THREE.MathUtils.randFloat(0.06, 0.12),
    };
  }, []);
  /* eslint-enable react-hooks/purity */

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(segmentCount * 2 * 3);
    const alphas = new Float32Array(segmentCount * 2);
    const uvs = new Float32Array(segmentCount * 2 * 2);
    const indices: number[] = [];

    for (let i = 0; i < segmentCount; i++) {
      const t = i / (segmentCount - 1);
      uvs[i * 4] = t;
      uvs[i * 4 + 1] = 0;
      uvs[i * 4 + 2] = t;
      uvs[i * 4 + 3] = 1;
    }

    for (let i = 0; i < segmentCount - 1; i++) {
      const a = i * 2;
      const b = i * 2 + 1;
      const c = i * 2 + 2;
      const d = i * 2 + 3;
      indices.push(a, b, c, b, d, c);
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(indices);

    return geo;
  }, []);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        opacity: { value: 1 },
        color: { value: new THREE.Color(1, 1, 1) },
      },
      vertexShader: `
        attribute float alpha;
        varying float vAlpha;
        varying vec2 vUv;

        void main() {
          vAlpha = alpha;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float opacity;
        uniform vec3 color;
        varying float vAlpha;
        varying vec2 vUv;

        void main() {
          float dist = abs(vUv.y - 0.5) * 2.0;
          float glow = 1.0 - smoothstep(0.0, 1.0, dist);
          glow = pow(glow, 1.2);

          float lengthGlow = 1.0 - smoothstep(0.0, 0.3, vUv.x);
          glow *= mix(1.0, 1.5, lengthGlow);

          float finalAlpha = glow * vAlpha * opacity;
          vec3 finalColor = mix(color, vec3(1.0, 1.0, 0.85), lengthGlow * 0.5);

          gl_FragColor = vec4(finalColor, finalAlpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }, []);

  useFrame(({ camera }) => {
    progressRef.current += config.speed;

    const posAttr = geometry.getAttribute('position');
    const alphaAttr = geometry.getAttribute('alpha');

    if (!posAttr || !alphaAttr) return;

    const positions = posAttr.array as Float32Array;
    const alphas = alphaAttr.array as Float32Array;

    const cameraRight = new THREE.Vector3();
    cameraRight.setFromMatrixColumn(camera.matrixWorld, 0);

    const fadeIn = Math.min(1, progressRef.current * 6);
    const fadeOut = Math.max(0, 1 - (progressRef.current - 1) * 4);
    const globalOpacity = fadeIn * fadeOut;

    // Update head position and opacity
    const headPosition = config.start.clone().addScaledVector(config.direction, progressRef.current * config.length);
    setHeadPos(headPosition);
    setHeadOpacity(globalOpacity);

    for (let i = 0; i < segmentCount; i++) {
      const t = i / (segmentCount - 1);
      const trailT = progressRef.current - t * 0.6;

      const pos = config.start.clone().addScaledVector(config.direction, trailT * config.length);

      // Smooth tapering
      const widthFactor = Math.pow(1 - t, 1.8) * (1 - t * 0.3);
      const width = config.width * widthFactor;

      const offset = cameraRight.clone().multiplyScalar(width);

      positions[i * 6] = pos.x - offset.x;
      positions[i * 6 + 1] = pos.y - offset.y;
      positions[i * 6 + 2] = pos.z - offset.z;

      positions[i * 6 + 3] = pos.x + offset.x;
      positions[i * 6 + 4] = pos.y + offset.y;
      positions[i * 6 + 5] = pos.z + offset.z;

      // Smooth alpha falloff
      const trailAlpha = Math.pow(1 - t, 1.2);
      const alpha = trailAlpha * globalOpacity;

      alphas[i * 2] = alpha;
      alphas[i * 2 + 1] = alpha;
    }

    posAttr.needsUpdate = true;
    alphaAttr.needsUpdate = true;
    geometry.computeBoundingSphere();

    if (progressRef.current > 1.25) {
      onComplete();
    }
  });

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry} material={material} />
      {/* Bright head glow */}
      <sprite position={headPos} scale={[0.4 * headOpacity, 0.4 * headOpacity, 1]}>
        <spriteMaterial
          map={starTexture}
          color={new THREE.Color(1, 1, 0.9)}
          transparent
          opacity={headOpacity * 1.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
    </group>
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
      const nextInterval = 3000 + Math.random() * 5000;
      timeoutId = setTimeout(spawnStar, nextInterval);
    };

    timeoutId = setTimeout(spawnStar, 1000 + Math.random() * 2000);

    return () => clearTimeout(timeoutId);
  }, []);

  const removeStar = (id: number) => {
    setStars(prev => prev.filter(starId => starId !== id));
  };

  return (
    <>
      {stars.map(id => (
        <ShootingStarComplete key={id} onComplete={() => removeStar(id)} />
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
