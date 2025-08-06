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
    const particleCount = isMobile ? 150 : 500 // Further reduced particles on mobile
    
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
  
  // Mobile detection for controls
  const isMobile = typeof window !== 'undefined' && (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  )
  
  return (
    <OrbitControls
      enableZoom={!isMobile} // Disable zoom on mobile to prevent scroll capture
      enablePan={false}
      autoRotate={!isMobile} // Disable auto-rotate on mobile for better performance
      autoRotateSpeed={0.1}
      maxPolarAngle={Math.PI}
      minPolarAngle={0}
      minDistance={200}
      maxDistance={600}
      enableDamping={true}
      dampingFactor={0.05}
      rotateSpeed={isMobile ? 0.2 : 0.5} // Slower on mobile
      zoomSpeed={0.5}
      enableRotate={!isMobile} // Disable rotation on mobile to prevent scroll issues
      touches={isMobile ? {} : {
        ONE: 2, // ROTATE
        TWO: 1  // DOLLY (zoom)
      }}
      mouseButtons={isMobile ? {} : {
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
    >
      {/* Simplified lighting for mobile */}
      <ambientLight intensity={isMobile ? 0.8 : 0.6} />
      {!isMobile && <directionalLight position={[10, 10, 5]} intensity={1.0} color="#ffffff" />}
      {!isMobile && <pointLight position={[-10, -10, -5]} intensity={0.4} color="#ffffff" />}

      <BrainModel />
      <Controls />
    </Canvas>
  )
}