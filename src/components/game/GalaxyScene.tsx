import { Html, Line, OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";

import { useSceneHost } from "./useSceneHost";
import type { Mesh } from "three";

export type MapBody = {
  id: string;
  name: string;
  owner_type: string;
  color: string;
  distance: number;
  pos_x: number | string;
  pos_y: number | string;
  pos_z: number | string;
  cleared: boolean;
};

type Props = {
  bodies: MapBody[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  quality?: "low" | "medium" | "high";
};

function Body({
  body,
  selected,
  onSelect,
}: {
  body: MapBody;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const mesh = useRef<Mesh>(null);
  const pos: [number, number, number] = [
    Number(body.pos_x),
    Number(body.pos_y),
    Number(body.pos_z),
  ];
  const radius = body.owner_type === "player" ? 0.85 : body.owner_type === "enemy" ? 0.7 : 0.55;
  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += 0.004;
    const s = selected ? 1.15 + Math.sin(state.clock.elapsedTime * 3) * 0.06 : 1;
    mesh.current.scale.setScalar(s);
  });

  return (
    <group position={pos}>
      <mesh
        ref={mesh}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(body.id);
        }}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={body.color}
          emissive={body.color}
          emissiveIntensity={selected ? 0.9 : 0.35}
          roughness={0.5}
        />
      </mesh>
      <Html center distanceFactor={18} position={[0, radius + 0.6, 0]}>
        <button
          onClick={() => onSelect(body.id)}
          className="whitespace-nowrap rounded border border-border/70 bg-background/80 px-2 py-0.5 text-[10px] uppercase tracking-widest text-foreground"
        >
          {body.name}
          {body.cleared ? " ✓" : ""}
        </button>
      </Html>
    </group>
  );
}

export default function GalaxyScene({ bodies, selectedId, onSelect, quality = "medium" }: Props) {
  const home = bodies.find((b) => b.owner_type === "player");
  const dpr: [number, number] =
    quality === "low" ? [0.6, 1] : quality === "high" ? [1, 2] : [1, 1.5];
  const { ref: hostRef, host } = useSceneHost();
  const origin: [number, number, number] = home
    ? [Number(home.pos_x), Number(home.pos_y), Number(home.pos_z)]
    : [0, 0, 0];

  return (
    <div ref={hostRef} className="h-full w-full">
      {host ? (
        <Canvas dpr={dpr} camera={{ position: [0, 9, 18], fov: 50 }} eventSource={host}>
          <ambientLight intensity={0.7} />
          <pointLight position={[0, 6, 0]} intensity={2} color="#9fd8ff" />
          {quality !== "low" && (
            <Stars
              radius={120}
              depth={60}
              count={quality === "high" ? 6000 : 2500}
              factor={4}
              fade
            />
          )}
          {bodies
            .filter((b) => b.owner_type !== "player")
            .map((b) => (
              <Line
                key={`line-${b.id}`}
                points={[origin, [Number(b.pos_x), Number(b.pos_y), Number(b.pos_z)]]}
                color={b.id === selectedId ? "#7ad7ff" : "#3d5a80"}
                lineWidth={b.id === selectedId ? 2 : 1}
                dashed
                dashSize={0.35}
                gapSize={0.35}
              />
            ))}
          {bodies.map((b) => (
            <Body key={b.id} body={b} selected={b.id === selectedId} onSelect={onSelect} />
          ))}
          <OrbitControls enablePan minDistance={6} maxDistance={40} />
        </Canvas>
      ) : null}
    </div>
  );
}
