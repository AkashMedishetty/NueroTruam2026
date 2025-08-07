'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, useGLTF } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Preload the brain model
useGLTF.preload('/brain_model.glb')

// Optimized Particle Sphere with reduced particle count
function ParticleSphere() {
  const particlesRef = useRef<THREE.Group>(null)

  // Mobile-optimized particle count
  const particlePositions = useMemo(() => {
    const positions = []
    // Detect mobile for particle optimization
    const isMobile = typeof window !== 'undefined' && (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth < 768
    )
    const particleCount = isMobile ? 280 : 900 // Significantly increased - mobile: 150->280 (+87%), desktop: 500->900 (+80%)

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

// Brain Model with mobile optimization and proper error handling
function BrainModel() {
  const meshRef = useRef<THREE.Group>(null)
  let scene: THREE.Group | null = null

  // Load 3D model for all devices
  try {
    const gltf = useGLTF('/brain_model.glb')
    scene = gltf.scene
  } catch (error) {
    console.log('Brain model not found, using fallback')
  }

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1 // Continuous rotation in complete circles
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
      autoRotate={true}
      autoRotateSpeed={0.1}
      maxPolarAngle={Math.PI}
      minPolarAngle={0}
      minDistance={200}
      maxDistance={600}
      enableDamping={true}
      dampingFactor={0.05}
      rotateSpeed={0.5}
      zoomSpeed={0.5}
      enableRotate={true}
      touches={{
        ONE: 2, // ROTATE
        TWO: 1  // DOLLY (zoom)
      }}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      }}
      onChange={() => invalidate()}
    />
  )
}

// Conditionally preload models based on device capability
if (typeof window !== 'undefined') {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768

  // Only preload heavy models on desktop devices
  if (!isMobile) {
    try {
      useGLTF.preload('/brain_model.glb')
    } catch (error) {
      console.log('Brain model preload failed, will use fallback')
    }
  }
}

export default function BrainModelClient() {
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
        camera={{ position: [0, 0, 300], fov: 75 }}
        style={{
          width: '100%',
          height: '100%',
          background: 'transparent',
          touchAction: isMobile ? 'pan-y pan-x' : 'none', // Critical: allow scroll on mobile
          pointerEvents: isMobile ? 'none' : 'auto' // Disable canvas interactions on mobile
        }}
        onPointerMissed={() => { }}
        gl={{
          antialias: !isMobile, // Disable antialiasing on mobile for performance
          alpha: true,
          preserveDrawingBuffer: false, // Better performance
          powerPreference: isMobile ? 'low-power' : 'high-performance',
          pixelRatio: isMobile ? Math.min(window.devicePixelRatio, 1.5) : window.devicePixelRatio // Limit pixel ratio on mobile
        }}
        dpr={isMobile ? [1, 1.5] : [1, 2]} // Lower DPR on mobile
        performance={{
          min: isMobile ? 0.2 : 0.5 // More aggressive performance throttling on mobile
        }}
        {...(isMobile ? {} : { eventSource: document.documentElement })} // Only set eventSource on desktop
      >
        {/* Simplified lighting for mobile */}
        <ambientLight intensity={isMobile ? 0.8 : 0.6} />
        {!isMobile && <directionalLight position={[10, 10, 5]} intensity={1.0} color="#ffffff" />}
        {!isMobile && <pointLight position={[-10, -10, -5]} intensity={0.4} color="#ffffff" />}

        <BrainModel />
        {!isMobile && <Controls />} {/* Only render controls on desktop */}
      </Canvas>
    </div>
  )
}