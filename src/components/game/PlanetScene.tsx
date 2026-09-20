import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";

import { useSceneHost } from "./useSceneHost";
import type { Group, Mesh } from "three";

type Props = {
  name: string;
  color?: string;
  /** total de níveis construídos — define quantas estações orbitam */
  structures: number;
  quality?: "low" | "medium" | "high";
};

function Planet({ color }: { color: string }) {
  const mesh = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (mesh.current) mesh.current.rotation.y += delta * 0.08;
  });
  return (
    <group>
      <mesh ref={mesh}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial color={color} roughness={0.75} metalness={0.25} />
      </mesh>
      <mesh scale={1.06}>
        <sphereGeometry args={[2, 48, 48]} />
        <meshBasicMaterial color="#5fd4ff" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

function Orbiters({ count }: { count: number }) {
  const group = useRef<Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.25;
  });
  const items = Array.from({ length: Math.min(24, count) });
  return (
    <group ref={group} rotation={[0.4, 0, 0.2]}>
      {items.map((_, i) => {
        const angle = (i / Math.max(1, items.length)) * Math.PI * 2;
        const radius = 3 + (i % 3) * 0.45;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle * 2) * 0.35,
              Math.sin(angle) * radius,
            ]}
          >
            <boxGeometry args={[0.16, 0.16, 0.32]} />
            <meshStandardMaterial color="#9fe8ff" emissive="#2aa9d6" emissiveIntensity={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function PlanetScene({ color = "#4ea8ff", structures, quality = "medium" }: Props) {
  const dpr: [number, number] =
    quality === "low" ? [0.6, 1] : quality === "high" ? [1, 2] : [1, 1.5];
  const { ref: hostRef, host } = useSceneHost();
  return (
    <div ref={hostRef} className="h-full w-full">
      {host ? (
        <Canvas dpr={dpr} camera={{ position: [0, 2.4, 8], fov: 45 }} eventSource={host}>
          <ambientLight intensity={0.45} />
          <directionalLight position={[6, 5, 4]} intensity={2.1} color="#fff2d8" />
          <pointLight position={[-6, -3, -4]} intensity={1.2} color="#5f7dff" />
          {quality !== "low" && (
            <Stars
              radius={90}
              depth={45}
              count={quality === "high" ? 5000 : 2200}
              factor={3}
              fade
            />
          )}
          <Planet color={color} />
          <Orbiters count={structures} />
          <OrbitControls
            enablePan={false}
            minDistance={5}
            maxDistance={14}
            autoRotate
            autoRotateSpeed={0.35}
          />
        </Canvas>
      ) : null}
    </div>
  );
}
