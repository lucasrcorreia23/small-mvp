'use client';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import {
  Caustics,
  Environment,
  MeshRefractionMaterial,
  useGLTF,
} from '@react-three/drei';
import { Suspense, useMemo, useRef, useState } from 'react';
import { EquirectangularReflectionMapping, type BufferGeometry, type Group } from 'three';
import { RGBELoader } from 'three-stdlib';

function useFirstGeometry(nodes: Record<string, unknown>) {
  return useMemo(() => {
    const values = Object.values(nodes) as Array<{ geometry?: BufferGeometry }>;
    const match = values.find((value) => value?.geometry);
    return match?.geometry ?? null;
  }, [nodes]);
}

/** Login: diagonal superior direita, ponta de baixo para dentro */
const LOGIN_DIAMOND_ROTATION = [0.35, 0.55, 0] as [number, number, number];

function DiamondMesh({
  envTexture,
  variant = 'default',
}: {
  envTexture: ReturnType<typeof useLoader>;
  variant?: 'default' | 'login';
}) {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const hoverLightRef = useRef<Group>(null);
  const { nodes } = useGLTF('/dflat.glb') as { nodes: Record<string, unknown> };
  const geometry = useFirstGeometry(nodes);
  const isLogin = variant === 'login';
  useMemo(() => {
    envTexture.mapping = EquirectangularReflectionMapping;
    envTexture.needsUpdate = true;
  }, [envTexture]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.15;
    if (hoverLightRef.current && !isLogin) {
      const targetX = state.pointer.x * 1.4;
      const targetY = -0.6 + state.pointer.y * 0.6;
      hoverLightRef.current.position.x += (targetX - hoverLightRef.current.position.x) * 0.15;
      hoverLightRef.current.position.y += (targetY - hoverLightRef.current.position.y) * 0.15;
    }
  });

  if (!geometry) return null;

  const meshContent = (
    <mesh
      geometry={geometry}
      rotation={[0, 0, 0]}
      scale={isLogin ? 1.9 : 2.7}
      castShadow={!isLogin}
      onPointerEnter={!isLogin ? () => setHovered(true) : undefined}
      onPointerLeave={!isLogin ? () => setHovered(false) : undefined}
    >
      <MeshRefractionMaterial
        envMap={envTexture}
        bounces={2}
        aberrationStrength={0.002}
        ior={isLogin ? 1.3 : 1.1}
        fresnel={5.5}
        color={isLogin ? '#A5BFF8' : '#b8c2d0'}
        toneMapped={true}
      />
    </mesh>
  );

  return (
    <group
      ref={groupRef}
      position={[0, -1.4, 0]}
      rotation={isLogin ? LOGIN_DIAMOND_ROTATION : [0, 0, 0]}
    >
      <group ref={hoverLightRef} position={[0, -0.6, 1.1]}>
        <pointLight
          color={isLogin ? '#cfe3ff' : '#d8dce4'}
          intensity={hovered ? 4 : 0}
          distance={2.5}
          decay={2}
        />
      </group>
      <pointLight
        color={isLogin ? '#d6e9ff' : '#dce0e6'}
        intensity={hovered ? 14 : 10}
        distance={6}
        decay={2}
        position={[0.6, -0.9, 0.8]}
      />
      <pointLight
        color={isLogin ? '#d6e9ff' : '#dce0e6'}
        intensity={hovered ? 10 : 7}
        distance={6}
        decay={2}
        position={[-0.6, -0.85, 0.6]}
      />
      <spotLight
        color={isLogin ? '#d6e9ff' : '#dce0e6'}
        intensity={isLogin ? 11 : 5}
        position={[0, -0.4, 2.4]}
        angle={0.4}
        penumbra={0.9}
        decay={1}
      />
      {/* Login: flexo no pé do diamante (luz na base, sem chão) */}
      {isLogin && (
        <pointLight
          color="#e8f2ff"
          intensity={22}
          distance={4}
          decay={2}
          position={[0, -1.35, 0.7]}
        />
      )}
      {isLogin ? (
        meshContent
      ) : (
        <Caustics
          causticsOnly={false}
          backside
          color="#d4d8e0"
          position={[0, 0.5, 0]}
          lightSource={[1, 1, 1]}
          worldRadius={0}
          ior={5}
          backsideIOR={4}
          intensity={hovered ? 0.1 : 0.07}
        >
          {meshContent}
        </Caustics>
      )}
    </group>
  );
}

function DiamondScene({ variant = 'default' }: { variant?: 'default' | 'login' }) {
  const envTexture = useLoader(RGBELoader, '/peppermint_powerplant_2_4k.hdr');
  const isLogin = variant === 'login';
  return (
    <>
      {!isLogin && <color attach="background" args={['#f9f9f9']} />}
      <ambientLight intensity={0.7 * Math.PI} color={isLogin ? '#d6e9ff' : '#e2e5eb'} />
      <spotLight
        decay={0}
        position={[4, 4, -8]}
        angle={0.18}
        penumbra={1}
        intensity={4.2}
      />
      <pointLight decay={0} position={[-8, -8, -8]} intensity={0.6} />
      <DiamondMesh envTexture={envTexture} variant={variant} />
      <Environment map={envTexture} />
    </>
  );
}

export function DiamondBackground() {
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      <div className="bg-[#f0f2f6] rounded-full blur-[180px] opacity-5 pointer-events-none" />
      <div className="bg-[#e8ebf0] rounded-full blur-[240px] opacity-5 pointer-events-none" />
      <div className="absolute left-0 bottom-0 h-full w-16 bg-gradient-to-r from-[#eef1f6] to-transparent opacity-10 pointer-events-none" />
      <div className="absolute right-0 bottom-0 h-full w-16 bg-gradient-to-l from-[#eef1f6] to-transparent opacity-10 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <Canvas
          shadows
          camera={{ position: [-3.2, 0.5, 3.5], fov: 45 }}
          gl={{ alpha: true, antialias: true }}
          dpr={[1, 1.5]}
        >
          <Suspense fallback={<color attach="background" args={['#f9f9f9']} />}>
            <DiamondScene variant="default" />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}

/** Login: angulação fixa, rotacionando, fundido ao fundo (clear transparente), inteiro na tela */
export function DiamondLogin() {
  return (
    <div className="w-full h-full mx-auto overflow-visible flex items-center justify-center">
      <Canvas
        shadows
        camera={{ position: [-3.8, 0.5, 4.2], fov: 42 }}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <DiamondScene variant="login" />
        </Suspense>
      </Canvas>
    </div>
  );
}

export function DiamondIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M12 2L2 9L12 22L22 9L12 2Z" fill="#ffffff" />
      <path d="M12 2L7 9H17L12 2Z" fill="#e2e8f0" opacity="0.9" />
      <path d="M7 9L12 22L2 9H7Z" fill="#cbd5f5" opacity="0.8" />
    </svg>
  );
}
