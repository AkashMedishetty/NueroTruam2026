'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// Preload the spine model
useGLTF.preload('/spine_model.glb')

// Spine Model with mobile optimization and proper error handling
function SpineModel() {
  const spineRef = useRef<THREE.Group>(null)
  let spineScene: THREE.Group | null = null

  // Load 3D model for all devices
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

// Conditionally preload spine model based on device capability
if (typeof window !== 'undefined') {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768

  // Only preload heavy models on desktop devices
  if (!isMobile) {
    try {
      useGLTF.preload('/spine_model.glb')
    } catch (error) {
      console.log('Spine model preload failed, will use fallback')
    }
  }
}

export default function SpineModelClient() {
  // Mobile performance detection
  const isMobile = typeof window !== 'undefined' && (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  )

  return (
    <div
      className="w-full h-full"
      style={{
        pointerEvents: isMobile ? 'none' : 'auto', // Completely disable pointer events on mobile
        touchAction: isMobile ? 'pan-y pan-x' : 'none' // Allow scroll on mobile, disable on desktop
      }}
    >
      <Canvas
        camera={{ position: [4, 0, 6], fov: 45 }}
        style={{
          height: '750px',
          width: '100%',
          touchAction: isMobile ? 'pan-y pan-x' : 'none', // Critical: allow scroll on mobile
          pointerEvents: isMobile ? 'none' : 'auto' // Disable canvas interactions on mobile
        }}
        className="rounded-2xl bg-gradient-to-br from-orange-50 to-white dark:from-gray-800 dark:to-gray-900"
        gl={{
          antialias: !isMobile, // Disable antialiasing on mobile for performance
          alpha: true,
          powerPreference: isMobile ? 'low-power' : 'high-performance',
          pixelRatio: isMobile ? Math.min(window.devicePixelRatio, 1.5) : window.devicePixelRatio
        }}
        dpr={isMobile ? [1, 1.5] : [1, 2]} // Lower DPR on mobile
        performance={{
          min: isMobile ? 0.2 : 0.5 // More aggressive performance throttling on mobile
        }}
        {...(isMobile ? {} : { eventSource: document.documentElement })} // Only set eventSource on desktop
      >
        {/* Optimized lighting for mobile */}
        <ambientLight intensity={0.4} />
        {!isMobile && (
          <>
            <directionalLight
              position={[10, 10, 5]}
              intensity={1.2}
              castShadow
              shadow-mapSize-width={512}
              shadow-mapSize-height={512}
            />
            <directionalLight position={[-5, 5, -5]} intensity={0.6} color="#ffffff" />
            <pointLight position={[0, 15, 0]} intensity={0.8} color="#ffa726" />
          </>
        )}
        {isMobile && <directionalLight position={[10, 10, 5]} intensity={1} />}

        <SpineModel />

        {!isMobile && ( // Only render controls on desktop
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            enableDamping={true}
            dampingFactor={0.05}
            rotateSpeed={0.6}
            zoomSpeed={0.4}
            minDistance={4}
            maxDistance={12}
            enableRotate={true}
            touches={{
              ONE: THREE.TOUCH.ROTATE,
              TWO: THREE.TOUCH.DOLLY_PAN
            }}
            mouseButtons={{
              LEFT: THREE.MOUSE.ROTATE,
              MIDDLE: THREE.MOUSE.DOLLY,
              RIGHT: THREE.MOUSE.PAN
            }}
          />
        )}
      </Canvas>
    </div>
  )
}