/**
 * PlayerShip — 低面数玩家飞船（视觉组件，变换由 GameEngine 驱动）
 */
import React from 'react';
import * as THREE from 'three';

interface PlayerShipProps {
  groupRef: React.RefObject<THREE.Group>;
}

export const PlayerShip: React.FC<PlayerShipProps> = ({ groupRef }) => (
  <group ref={groupRef}>
    {/* 机身 */}
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <coneGeometry args={[0.42, 1.5, 5]} />
      <meshStandardMaterial color="#dfe8ff" metalness={0.65} roughness={0.3} emissive="#3f6bff" emissiveIntensity={0.3} />
    </mesh>
    {/* 机翼 */}
    <mesh position={[0.62, 0, 0.15]} rotation={[0, 0, -0.18]}>
      <boxGeometry args={[0.9, 0.06, 0.5]} />
      <meshStandardMaterial color="#aebdff" metalness={0.6} roughness={0.35} emissive="#243e99" emissiveIntensity={0.4} />
    </mesh>
    <mesh position={[-0.62, 0, 0.15]} rotation={[0, 0, 0.18]}>
      <boxGeometry args={[0.9, 0.06, 0.5]} />
      <meshStandardMaterial color="#aebdff" metalness={0.6} roughness={0.35} emissive="#243e99" emissiveIntensity={0.4} />
    </mesh>
    {/* 座舱 */}
    <mesh position={[0, 0.12, -0.25]}>
      <sphereGeometry args={[0.2, 12, 10]} />
      <meshStandardMaterial color="#5eead4" metalness={0.3} roughness={0.2} emissive="#22d3ee" emissiveIntensity={0.7} />
    </mesh>
    {/* 引擎光 */}
    <mesh position={[0, 0, 0.85]} rotation={[Math.PI / 2, 0, 0]}>
      <coneGeometry args={[0.16, 0.5, 6]} />
      <meshStandardMaterial color="#8be9ff" emissive="#00c8ff" emissiveIntensity={2.2} />
    </mesh>
    <pointLight position={[0, 0, 1]} intensity={2.2} distance={5} color="#38bdf8" />
  </group>
);
