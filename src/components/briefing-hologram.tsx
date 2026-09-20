'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Sparkles, useGLTF } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import type { Group } from 'three';

function Wolf() { const group = useRef<Group>(null); const gltf = useGLTF('/wolf_ps1.glb'); useFrame((_, delta) => { if (group.current) group.current.rotation.y += delta * .22; }); return <primitive ref={group} object={gltf.scene} scale={1.45} position={[0, -1.2, 0]} />; }
function FallbackWolf() { return <Float speed={2}><mesh><octahedronGeometry args={[1.1, 1]} /><meshStandardMaterial color="#ec4899" emissive="#831843" emissiveIntensity={1.5} wireframe /></mesh></Float>; }

export default function BriefingHologram({ briefing = 'The path is ready. Select your next move.' }: { briefing?: string }) {
  return <section className="mecha-panel overflow-hidden border border-pink-200 bg-white/80 p-3 shadow-[0_0_34px_rgba(236,72,153,.18)] backdrop-blur"><div className="h-52"><Canvas camera={{ position: [0, .3, 4], fov: 42 }}><ambientLight intensity={1.3}/><pointLight position={[2, 3, 3]} color="#f472b6" intensity={20}/><Sparkles count={45} scale={4} size={2} color="#ec4899"/><Suspense fallback={<FallbackWolf/>}><Wolf/></Suspense><OrbitControls enablePan={false} minDistance={3} maxDistance={5}/></Canvas></div><p className="border-l-2 border-pink-500 px-3 py-2 font-mono text-[10px] leading-5 text-slate-600"><span className="font-bold text-pink-600">WOLF // BRIEFING:</span> {briefing}</p></section>;
}
useGLTF.preload('/wolf_ps1.glb');
