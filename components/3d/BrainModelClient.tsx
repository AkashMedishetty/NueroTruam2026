'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, useGLTF } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Optimized Particle Sphere with reduced particle count
function ParticleSphere() {
  const particlesRef = useRef<THREE.Group>(null)
  
  // Reduced particle count for better performance
  const particlePositions = useMemo(() => {
    const positions = []
    const particleCount = 500 // Reduced from 1500 for better performance
    
    for (let i = 0; i < particleCount; i++) {
      // Fibonacci sphere distribution for even spacing
      const y = 1 - (i / (particleCount - 1)) * 2
      const radiusAtY = Math.sqrt(1 - y * y)
      const theta = (Math.PI * (3 - Math.sqrt(5))) * i
      
      const x = Math.cos(theta) * radiusAtY
      const z = Math.sin(theta) * radiusAtY
      
      const sphereRadius = 160
      positions.push([x * sphereRadius, y * sphereRadius, z * sphereRadius])
    }
    return positions
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      // Gentle rotation
      particlesRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.03) * 0.05
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.03
    }
  })

  return (
    <group ref={particlesRef}>
      {particlePositions.map((position, i) => (
        <mesh key={i} position={[position[0], position[1], position[2]]}>
          <sphereGeometry args={[0.8, 4, 4]} />
          <meshBasicMaterial 
            color="#ff6b35"
            transparent 
            opacity={0.5}
          />
        </mesh>
      ))}
    </group>
  )
}

// Brain Model with proper error handling
function BrainModel() {
  const meshRef = useRef<THREE.Group>(null)
  let scene: THREE.Group | null = null
  
  try {
    const gltf = useGLTF('/brain_model.glb')
    scene = gltf.scene
  } catch (error) {
    console.log('Brain model not found, using fallback')
  }

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.1
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05
    }
  })

  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      <ParticleSphere />
      
      <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.1}>
        {scene ? (
          <primitive 
            object={scene.clone()} 
            scale={[1000, 1000, 1000]} 
            position={[10, -5, 0]} 
          />
        ) : (
          // Fallback brain representation
          <group position={[0, 0, 0]}>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[50.0, 16, 16]} />
              <meshBasicMaterial 
                color="#ff6b35" 
                transparent 
                opacity={0.9}
              />
            </mesh>
            <mesh position={[18.0, 8.0, 12.0]}>
              <sphereGeometry args={[20.0, 12, 12]} />
              <meshBasicMaterial 
                color="#e55a2b" 
                transparent 
                opacity={0.7}
              />
            </mesh>
            <mesh position={[-18.0, 6.0, 8.0]}>
              <sphereGeometry args={[18.0, 12, 12]} />
              <meshBasicMaterial 
                color="#e55a2b" 
                transparent 
                opacity={0.7}
              />
            </mesh>
            <mesh position={[0, -8.0, -4.0]}>
              <sphereGeometry args={[15.0, 12, 12]} />
              <meshBasicMaterial 
                color="#e55a2b" 
                transparent 
                opacity={0.7}
              />
            </mesh>
          </group>
        )}
      </Float>
    </group>
  )
}

function Controls() {
  const invalidate = useThree((state) => state.invalidate)
  return (
    <OrbitControls
      enableZoom={true}
      enablePan={false}
      autoRotate
      autoRotateSpeed={0.1}
      maxPolarAngle={Math.PI}
      minPolarAngle={0}
      minDistance={200}
      maxDistance={600}
      enableDamping={true}
      dampingFactor={0.05}
      rotateSpeed={0.5}
      zoomSpeed={0.5}
      touches={{
        ONE: 2, // ROTATE
        TWO: 1  // DOLLY (zoom)
      }}
      onChange={() => invalidate()}
    />
  )
}

// Preload models with error handling
try {
  useGLTF.preload('/brain_model.glb')
} catch (error) {
  console.log('Brain model preload failed, will use fallback')
}

export default function BrainModelClient() {
  return (
    <Canvas
      camera={{ position: [0, 0, 300], fov: 75 }}
      style={{ 
        width: '100%', 
        height: '100%',
        background: 'transparent',
        touchAction: 'auto'
      }}
      onPointerMissed={() => {}}
      gl={{ 
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance'
      }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.0} color="#ffffff" />
      <pointLight position={[-10, -10, -5]} intensity={0.4} color="#ffffff" />

      <BrainModel />
      <Controls />
    </Canvas>
  )
}