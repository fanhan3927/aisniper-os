/**
 * GameEngine — 3D 太空射击核心仿真（对象池 + useFrame，无每帧 React 渲染）
 * 玩家 / 子弹池 / 敌机 / 陨石 / 粒子 / 碰撞 / 波次。
 * 所有离散事件（击杀/受击/波次）才写 gameStore，保证 HUD 流畅。
 */
import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { controls, resetControls } from './controls';
import { gameBridge, type RadarPoint } from './gameBridge';
import { sfx } from '../../lib/sfx';
import { PlayerShip } from './PlayerShip';

const FIELD_X = 7.2;
const FIELD_Y = 4.4;
const BULLET_POOL = 42;
const ENEMY_POOL = 16;
const ASTEROID_POOL = 12;
const PARTICLE_POOL = 150;
const PLAYER_Z = 0.6;

interface BulletSlot {
  active: boolean;
  x: number;
  y: number;
  z: number;
  ref: React.RefObject<THREE.Mesh>;
}
interface EnemySlot {
  active: boolean;
  kind: 'fighter' | 'cruiser';
  x: number;
  y: number;
  z: number;
  hp: number;
  maxHp: number;
  speed: number;
  t: number;
  strafe: number;
  groupRef: React.RefObject<THREE.Group>;
  fighterRef: React.RefObject<THREE.Mesh>;
  cruiserRef: React.RefObject<THREE.Mesh>;
}
interface AsteroidSlot {
  active: boolean;
  x: number;
  y: number;
  z: number;
  speed: number;
  rotX: number;
  rotY: number;
  vrX: number;
  vrY: number;
  scale: number;
  ref: React.RefObject<THREE.Mesh>;
}
interface ParticleSlot {
  active: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  ref: React.RefObject<THREE.Mesh>;
}

export interface Sim {
  player: { x: number; y: number; cooldown: number; invuln: number; alive: boolean; ref: React.RefObject<THREE.Group> };
  bullets: BulletSlot[];
  enemies: EnemySlot[];
  asteroids: AsteroidSlot[];
  particles: ParticleSlot[];
  asteroidT: number;
  waveClearT: number;
  started: boolean;
  flash: React.RefObject<THREE.Mesh>;
}

function makeSim(): Sim {
  const mkBullet = (): BulletSlot => ({ active: false, x: 0, y: 0, z: 0, ref: React.createRef<THREE.Mesh>() });
  const mkEnemy = (): EnemySlot => ({
    active: false,
    kind: 'fighter',
    x: 0,
    y: 0,
    z: 0,
    hp: 1,
    maxHp: 1,
    speed: 1,
    t: 0,
    strafe: 0,
    groupRef: React.createRef<THREE.Group>(),
    fighterRef: React.createRef<THREE.Mesh>(),
    cruiserRef: React.createRef<THREE.Mesh>(),
  });
  const mkAsteroid = (): AsteroidSlot => ({
    active: false,
    x: 0,
    y: 0,
    z: 0,
    speed: 1,
    rotX: 0,
    rotY: 0,
    vrX: 0.02,
    vrY: 0.03,
    scale: 1,
    ref: React.createRef<THREE.Mesh>(),
  });
  const mkParticle = (): ParticleSlot => ({
    active: false,
    x: 0,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    life: 0,
    maxLife: 1,
    ref: React.createRef<THREE.Mesh>(),
  });
  return {
    player: { x: 0, y: 0, cooldown: 0, invuln: 0, alive: true, ref: React.createRef<THREE.Group>() },
    bullets: Array.from({ length: BULLET_POOL }, mkBullet),
    enemies: Array.from({ length: ENEMY_POOL }, mkEnemy),
    asteroids: Array.from({ length: ASTEROID_POOL }, mkAsteroid),
    particles: Array.from({ length: PARTICLE_POOL }, mkParticle),
    asteroidT: 1.4,
    waveClearT: 0,
    started: false,
    flash: React.createRef<THREE.Mesh>(),
  };
}

function spawnExplosion(sim: Sim, x: number, y: number, z: number, size = 1): void {
  const count = Math.round(10 + size * 4);
  let spawned = 0;
  for (const p of sim.particles) {
    if (spawned >= count) break;
    if (p.active) continue;
    p.active = true;
    p.x = x;
    p.y = y;
    p.z = z;
    const sp = (3 + Math.random() * 4) * size;
    p.vx = (Math.random() - 0.5) * sp;
    p.vy = (Math.random() - 0.5) * sp;
    p.vz = (Math.random() - 0.5) * sp;
    p.maxLife = 0.35 + Math.random() * 0.35;
    p.life = p.maxLife;
    spawned++;
  }
}

export const GameEngine: React.FC = () => {
  const simRef = useRef<Sim | null>(null);
  if (!simRef.current) simRef.current = makeSim();
  const sim = simRef.current;

  const playerRef = sim.player.ref;
  const flashRef = sim.flash;

  // —— 键盘输入 ——
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k)) e.preventDefault();
      if (k === ' ' || k === 'k') controls.fire = true;
      if (k === 'arrowup' || k === 'w') controls.up = true;
      if (k === 'arrowdown' || k === 's') controls.down = true;
      if (k === 'arrowleft' || k === 'a') controls.left = true;
      if (k === 'arrowright' || k === 'd') controls.right = true;
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === ' ' || k === 'k') controls.fire = false;
      if (k === 'arrowup' || k === 'w') controls.up = false;
      if (k === 'arrowdown' || k === 's') controls.down = false;
      if (k === 'arrowleft' || k === 'a') controls.left = false;
      if (k === 'arrowright' || k === 'd') controls.right = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      resetControls();
    };
  }, []);

  // —— 波次生成 ——
  const spawnWave = (wave: number) => {
    const count = Math.min(3 + wave, 12);
    let idx = 0;
    for (let i = 0; i < count && idx < ENEMY_POOL; i++) {
      while (idx < ENEMY_POOL && sim.enemies[idx].active) idx++;
      if (idx >= ENEMY_POOL) break;
      const e = sim.enemies[idx];
      const side = i % 2 === 0 ? 1 : -1;
      const row = Math.floor(i / 2);
      e.active = true;
      e.kind = 'fighter';
      e.x = side * (0.9 + row * 1.3);
      e.y = 0.6 + (i % 3) * 0.5;
      e.z = -36 - row * 2.6;
      e.hp = 1;
      e.maxHp = 1;
      e.speed = 4.6 + wave * 0.22 + Math.random() * 0.7;
      e.t = 0;
      e.strafe = 0.5 + Math.random() * 0.9;
      idx++;
    }
    // 每 3 波一艘巡洋舰
    if (wave % 3 === 0) {
      const idx2 = sim.enemies.findIndex((e) => !e.active);
      if (idx2 >= 0) {
        const e = sim.enemies[idx2];
        e.active = true;
        e.kind = 'cruiser';
        e.x = 0;
        e.y = 0;
        e.z = -42;
        e.hp = 5 + Math.floor(wave / 3);
        e.maxHp = e.hp;
        e.speed = 1.1 + wave * 0.03;
        e.t = 0;
        e.strafe = 0.8;
      }
    }
  };

  // —— 仿真主循环 ——
  useFrame((_, delta) => {
    const gs = useGameStore.getState();
    if (gs.phase !== 'playing') return;
    if (document.hidden) return;
    const dt = Math.min(delta, 0.05); // 秒制步长（上限 50ms 防跳帧）

    const p = sim.player;

    // 玩家移动：键盘优先，否则向鼠标目标缓动；触屏摇杆覆盖
    if (controls.joy.active) {
      p.x += controls.joy.x * 8.5 * dt;
      p.y += controls.joy.y * 8.5 * dt;
    } else if (controls.up || controls.down || controls.left || controls.right) {
      const spd = 8.5 * dt;
      if (controls.left) p.x -= spd;
      if (controls.right) p.x += spd;
      if (controls.up) p.y += spd;
      if (controls.down) p.y -= spd;
    } else if (controls.pointer.active) {
      p.x += (controls.pointer.x - p.x) * Math.min(1, 9 * dt);
      p.y += (controls.pointer.y - p.y) * Math.min(1, 9 * dt);
    }
    p.x = Math.max(-FIELD_X, Math.min(FIELD_X, p.x));
    p.y = Math.max(-FIELD_Y, Math.min(FIELD_Y, p.y));

    // 无敌帧倒计时
    if (p.invuln > 0) p.invuln -= dt;

    // 射击（子弹对象池）
    p.cooldown -= dt;
    if ((controls.fire || controls.joy.active) && p.cooldown <= 0 && p.alive) {
      const b = sim.bullets.find((x) => !x.active);
      if (b) {
        b.active = true;
        b.x = p.x;
        b.y = p.y;
        b.z = PLAYER_Z + 1;
        p.cooldown = 0.16;
        sfx.shoot();
      }
    }

    // 子弹更新
    for (const b of sim.bullets) {
      if (!b.active) continue;
      b.z -= 16 * dt;
      if (b.z < -46) b.active = false;
    }

    // 敌人更新
    let anyEnemy = false;
    for (const e of sim.enemies) {
      if (!e.active) continue;
      anyEnemy = true;
      e.t += dt;
      e.z += e.speed * dt;
      if (e.kind === 'fighter') {
        e.x += Math.sin(e.t * 2.4) * 0.9 * dt;
      } else {
        e.y = Math.sin(e.t * 1.2) * 0.8;
      }
      if (e.z > 4) e.active = false;
    }

    // 陨石更新
    for (const a of sim.asteroids) {
      if (!a.active) continue;
      a.z += a.speed * dt;
      a.rotX += a.vrX * dt;
      a.rotY += a.vrY * dt;
      if (a.z > 4) a.active = false;
    }
    sim.asteroidT -= dt;
    if (sim.asteroidT <= 0) {
      sim.asteroidT = 1.1 + Math.random() * 1.4;
      const a = sim.asteroids.find((x) => !x.active);
      if (a) {
        const w = useGameStore.getState().wave;
        a.active = true;
        a.x = (Math.random() * 2 - 1) * FIELD_X * 0.9;
        a.y = (Math.random() * 2 - 1) * FIELD_Y * 0.8;
        a.z = -48;
        a.speed = 4.2 + w * 0.12 + Math.random() * 1.6;
        a.scale = 0.5 + Math.random() * 0.7;
        a.vrX = (Math.random() - 0.5) * 0.5;
        a.vrY = (Math.random() - 0.5) * 0.5;
      }
    }

    // 碰撞：子弹 × 敌人/陨石
    for (const b of sim.bullets) {
      if (!b.active) continue;
      for (const e of sim.enemies) {
        if (!e.active) continue;
        const rr = e.kind === 'cruiser' ? 1.5 : 0.95;
        const dx = b.x - e.x;
        const dy = b.y - e.y;
        const dz = b.z - e.z;
        if (dx * dx + dy * dy + dz * dz < rr * rr) {
          b.active = false;
          e.hp -= 1;
          spawnExplosion(sim, b.x, b.y, b.z, 0.5);
          sfx.hit();
          if (e.hp <= 0) {
            killEnemy(e);
          }
          break;
        }
      }
      if (!b.active) continue;
      for (const a of sim.asteroids) {
        if (!a.active) continue;
        const rr = 0.8 + a.scale;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dz = b.z - a.z;
        if (dx * dx + dy * dy + dz * dz < rr * rr) {
          b.active = false;
          a.active = false;
          spawnExplosion(sim, a.x, a.y, a.z, a.scale * 1.4);
          sfx.explosion();
          award(60, 1);
          break;
        }
      }
    }

    // 碰撞：敌人/陨石 × 玩家
    if (p.alive && p.invuln <= 0) {
      for (const e of sim.enemies) {
        if (!e.active) continue;
        const dx = p.x - e.x;
        const dy = p.y - e.y;
        const dz = PLAYER_Z - e.z;
        if (dx * dx + dy * dy + dz * dz < 1.7) {
          e.active = false;
          hurtPlayer(e.x, e.y, e.z);
          break;
        }
      }
      if (p.alive && p.invuln <= 0) {
        for (const a of sim.asteroids) {
          if (!a.active) continue;
          const dx = p.x - a.x;
          const dy = p.y - a.y;
          const dz = PLAYER_Z - a.z;
          if (dx * dx + dy * dy + dz * dz < 1.4 + a.scale) {
            a.active = false;
            hurtPlayer(a.x, a.y, a.z);
            break;
          }
        }
      }
    }

    // 粒子更新
    for (const pt of sim.particles) {
      if (!pt.active) continue;
      pt.life -= dt;
      if (pt.life <= 0) {
        pt.active = false;
        continue;
      }
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.z += pt.vz * dt;
    }

    // 波次推进：敌机清空后进入下一波（陨石为环境因素，不阻塞）
    if (!anyEnemy) {
      sim.waveClearT -= dt;
      if (sim.waveClearT <= 0) {
        sim.waveClearT = 2.6;
        const next = gs.wave + 1;
        gs.setWave(next);
        spawnWave(next);
      }
    }

    // —— 写入 Three 对象变换 ——
    if (playerRef.current) {
      playerRef.current.position.set(p.x, p.y, PLAYER_Z);
      const bank = p.invuln > 0 && Math.floor(p.invuln * 10) % 2 === 0;
      playerRef.current.visible = p.alive && !bank;
      const bankX = controls.joy.active ? controls.joy.x : Math.max(-1, Math.min(1, p.x / 4));
      playerRef.current.rotation.z = -bankX * 0.14;
    }
    for (const b of sim.bullets) {
      if (!b.ref.current) continue;
      b.ref.current.visible = b.active;
      if (b.active) b.ref.current.position.set(b.x, b.y, b.z);
    }
    for (const e of sim.enemies) {
      if (!e.groupRef.current) continue;
      e.groupRef.current.visible = e.active;
      if (e.active) {
        e.groupRef.current.position.set(e.x, e.y, e.z);
        if (e.fighterRef.current) e.fighterRef.current.visible = e.kind === 'fighter';
        if (e.cruiserRef.current) e.cruiserRef.current.visible = e.kind === 'cruiser';
      }
    }
    for (const a of sim.asteroids) {
      if (!a.ref.current) continue;
      a.ref.current.visible = a.active;
      if (a.active) {
        a.ref.current.position.set(a.x, a.y, a.z);
        a.ref.current.rotation.set(a.rotX, a.rotY, 0);
      }
    }
    for (const pt of sim.particles) {
      if (!pt.ref.current) continue;
      pt.ref.current.visible = pt.active;
      if (pt.active) {
        pt.ref.current.position.set(pt.x, pt.y, pt.z);
        const s = pt.life / pt.maxLife;
        pt.ref.current.scale.setScalar(Math.max(0.01, s));
      }
    }
    if (flashRef.current) flashRef.current.visible = false;

    // 雷达桥
    const radar: RadarPoint[] = [];
    for (const e of sim.enemies) if (e.active) radar.push({ x: e.x, z: e.z, kind: 'enemy' });
    for (const a of sim.asteroids) if (a.active) radar.push({ x: a.x, z: a.z, kind: 'asteroid' });
    gameBridge.setRadar(radar);

    // 辅助函数（闭包内）
    function killEnemy(e: EnemySlot): void {
      e.active = false;
      spawnExplosion(sim, e.x, e.y, e.z, e.kind === 'cruiser' ? 2.2 : 1.1);
      sfx.explosion();
      award(e.kind === 'cruiser' ? 500 : 100, e.kind === 'cruiser' ? 3 : 1);
    }
    function award(base: number, comboAdd: number): void {
      const s = useGameStore.getState();
      s.hit();
      const mult = 1 + Math.floor(s.combo / 5);
      s.addScore(base * mult);
    }
    function hurtPlayer(x: number, y: number, z: number): void {
      spawnExplosion(sim, x, y, z, 1.6);
      sfx.hurt();
      const s = useGameStore.getState();
      s.loseLife();
      if (s.lives <= 0) {
        p.alive = false;
        s.setPhase('over');
        s.recordScore();
      } else {
        p.invuln = 1.6; // 受击后 1.6s 无敌
        if (flashRef.current) {
          flashRef.current.visible = true;
          flashRef.current.position.set(p.x, p.y, PLAYER_Z);
        }
      }
    }
  });

  // —— 渲染：对象池网格 ——
  return (
    <>
      <PlayerShip groupRef={playerRef} />
      <mesh ref={flashRef} visible={false}>
        <sphereGeometry args={[1.2, 12, 10]} />
        <meshBasicMaterial color="#bfe3ff" transparent opacity={0.5} />
      </mesh>

      {/* 子弹池 */}
      {sim.bullets.map((b, i) => (
        <mesh key={`b${i}`} ref={b.ref} visible={false}>
          <cylinderGeometry args={[0.09, 0.09, 0.75, 6]} />
          <meshBasicMaterial color="#7dd3fc" />
        </mesh>
      ))}

      {/* 敌机池 */}
      {sim.enemies.map((e, i) => (
        <group key={`e${i}`} ref={e.groupRef} visible={false}>
          <mesh ref={e.fighterRef} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.42, 1.0, 5]} />
            <meshStandardMaterial color="#ff6b4a" emissive="#ff3b1f" emissiveIntensity={0.8} metalness={0.4} roughness={0.4} />
          </mesh>
          <mesh ref={e.cruiserRef} visible={false}>
            <boxGeometry args={[2.4, 0.9, 1.4]} />
            <meshStandardMaterial color="#b45309" emissive="#ea580c" emissiveIntensity={0.35} metalness={0.5} roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* 陨石池 */}
      {sim.asteroids.map((a, i) => (
        <mesh key={`a${i}`} ref={a.ref} visible={false}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color="#8a7f6f" roughness={0.95} metalness={0.05} flatShading />
        </mesh>
      ))}

      {/* 粒子池 */}
      {sim.particles.map((pt, i) => (
        <mesh key={`p${i}`} ref={pt.ref} visible={false}>
          <octahedronGeometry args={[0.13, 0]} />
          <meshBasicMaterial color="#ffd9a0" />
        </mesh>
      ))}
    </>
  );
};
