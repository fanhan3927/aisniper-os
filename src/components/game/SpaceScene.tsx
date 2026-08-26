/**
 * SpaceScene — 星空、弱雾、环境光（R3F 场景装饰层）
 */
import React from 'react';
import { Stars } from '@react-three/drei';

export const SpaceScene: React.FC = () => (
  <>
    <fog attach="fog" args={['#05060c', 20, 62]} />
    <ambientLight intensity={0.4} />
    <directionalLight position={[6, 10, 8]} intensity={1.1} color="#cfe3ff" />
    <pointLight position={[0, 3, 0]} intensity={14} distance={16} color="#3f6bff" />
    <Stars radius={90} depth={42} count={2400} factor={3.4} saturation={0} fade speed={0.7} />
    <Stars radius={55} depth={30} count={700} factor={6} saturation={0.7} fade speed={0.5} />
  </>
);
