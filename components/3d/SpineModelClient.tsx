'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// Spine Model with proper error handling
function SpineModel() {
  const spineRef = useRef<THREE.Group>(null)
  let spineScene: THREE.Group | null = null
  
  try {
    const gltf = useGLTF('/spine_model.glb')
    spineScene = gltf.scene
  } catch (error) {
    console.log('Spine GLB not found, using fallback spine')
  }

  useFrame((state) => {
    if (spineRef.current) {
      spineRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.3
      spineRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.5
    }
  })

  return (
    <group ref={spineRef} position={[0, 0, 0]}>
      <Float speed={1.0} rotationIntensity={0.1} floatIntensity={0.2}>
        {spineScene ? (
          <primitive 
            object={spineScene.clone()} 
            scale={[0.3, 0.3, 0.3]}
            position={[0, -8, 0]}
            rotation={[0, 0, 0]}
          />
        ) : (
          // Fallback spine representation - simplified for better performance
          <group position={[0, -15, 0]} scale={[0.85, 0.85, 0.85]}>
            {[...Array(12)].map((_, i) => ( // Reduced from 15 to 12 for performance
              <group key={i} position={[0, (i - 6) * 2.5, 0]}>
                <mesh>
                  <cylinderGeometry args={[1.2 + Math.sin(i * 0.3) * 0.15, 1.2 + Math.sin(i * 0.3) * 0.15, 2.0, 6]} />
                  <meshStandardMaterial 
                    color="#f8f8f8" 
                    transparent 
                    opacity={0.9}
                    roughness={0.7}
                    metalness={0.1}
                  />
                </mesh>
                {/* Simplified side processes */}
                <mesh position={[2, 0, 0]}>
                  <cylinderGeometry args={[0.4, 0.4, 1.5, 4]} />
                  <meshStandardMaterial 
                    color="#e0e0e0" 
                    transparent 
                    opacity={0.8}
                    roughness={0.8}
                  />
                </mesh>
                <mesh position={[-2, 0, 0]}>
                  <cylinderGeometry args={[0.4, 0.4, 1.5, 4]} />
                  <meshStandardMaterial 
                    color="#e0e0e0" 
                    transparent 
                    opacity={0.8}
                    roughness={0.8}
                  />
                </mesh>
              </group>
            ))}
          </group>
        )}
      </Float>
    </group>
  )
}

// Preload spine model with error handling
try {
  useGLTF.preload('/spine_model.glb')
} catch (error) {
  console.log('Spine model preload failed, will use fallback')
}

export default function SpineModelClient() {
  return (
    <Canvas
      camera={{ position: [4, 0, 6], fov: 45 }}
      style={{ 
        height: '750px',
        width: '100%',
        touchAction: 'auto'
      }}
      className="rounded-2xl bg-gradient-to-br from-orange-50 to-white dark:from-gray-800 dark:to-gray-900"
      gl={{ 
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.2} 
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.6} color="#ffffff" />
      <pointLight position={[0, 15, 0]} intensity={0.8} color="#ffa726" />

      <SpineModel />

      <OrbitControls
        enableZoom={true}
        enablePan={false}
        enableDamping={true}
        dampingFactor={0.05}
        rotateSpeed={0.6}
        zoomSpeed={0.4}
        minDistance={4}
        maxDistance={12}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN
        }}
      />

      {/* Basic lighting setup instead of Environment preset to avoid CSP issues */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />
    </Canvas>
  )
}