"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { DESTINATIONS } from "@/lib/destinations";

function latLngToVec3(lat: number, lng: number, r: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function Earth({ activeId }: { activeId?: string }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.12;
  });

  const pins = useMemo(
    () => DESTINATIONS.map((d) => ({ id: d.id, pos: latLngToVec3(d.lat, d.lng, 1.52), c: d.c1 })),
    []
  );

  return (
    <group ref={group}>
      {/* 지구 본체 */}
      <mesh>
        <sphereGeometry args={[1.5, 48, 48]} />
        <meshStandardMaterial color="#0b2545" roughness={0.85} metalness={0.15} />
      </mesh>
      {/* 대기 글로우 */}
      <mesh>
        <sphereGeometry args={[1.62, 48, 48]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
      {/* 위도/경도 와이어 */}
      <mesh>
        <sphereGeometry args={[1.505, 24, 24]} />
        <meshBasicMaterial color="#1d6fa5" wireframe transparent opacity={0.25} />
      </mesh>
      {/* 여행지 핀 */}
      {pins.map((p) => {
        const active = p.id === activeId;
        return (
          <mesh key={p.id} position={p.pos}>
            <sphereGeometry args={[active ? 0.06 : 0.035, 12, 12]} />
            <meshBasicMaterial color={active ? "#fbbf24" : p.c} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function Globe({ activeId }: { activeId?: string }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 2, 4]} intensity={1.1} />
      <pointLight position={[-4, -2, -3]} intensity={0.4} color="#a855f7" />
      <Earth activeId={activeId} />
    </Canvas>
  );
}
