import { useRef, useEffect, useState, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Physics, useSphere, useBox, usePlane } from '@react-three/cannon'
import { OrbitControls, Text, useTexture, useGLTF } from '@react-three/drei'
import { useGameStore } from '../store/gameStore'
import * as THREE from 'three'

// Floor component
function Floor() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    type: 'Static'
  }))
  
  return (
    <group>
      <mesh ref={ref} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#2d5a27" />
      </mesh>
      {/* Invisible walls */}
      <mesh position={[0, 2.5, -8]}>
        <boxGeometry args={[20, 5, 1]} />
        <meshStandardMaterial visible={false} />
      </mesh>
      <mesh position={[0, 2.5, 8]}>
        <boxGeometry args={[20, 5, 1]} />
        <meshStandardMaterial visible={false} />
      </mesh>
      <mesh position={[-8, 2.5, 0]}>
        <boxGeometry args={[1, 5, 20]} />
        <meshStandardMaterial visible={false} />
      </mesh>
      <mesh position={[8, 2.5, 0]}>
        <boxGeometry args={[1, 5, 20]} />
        <meshStandardMaterial visible={false} />
      </mesh>
    </group>
  )
}

// Monster character component - laadt willekeurig karakter uit glbs folder
function Monster({ position }) {
  const modelRef = useRef()
  
  // Kies een willekeurig karakter (a-r)
  const charIndex = useMemo(() => Math.floor(Math.random() * 18), [])
  const charLetter = String.fromCharCode(97 + charIndex) // a-r
  const modelPath = `/glbs/character-${charLetter}.glb`
  
  const { scene } = useGLTF(modelPath)
  
  useFrame((state) => {
    if (modelRef.current) {
      modelRef.current.position.set(
        position[0],
        position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.1,
        position[2]
      )
    }
  })
  
  // Toon GLB model als het laadt, anders fallback
  if (scene) {
    return <primitive ref={modelRef} object={scene.clone()} scale={0.5} />
  }
  
  // Fallback poppetje - groen monster
  return (
    <group ref={modelRef}>
      <mesh position={[position[0], position[1], position[2]]}>
        <sphereGeometry args={[0.35]} />
        <meshStandardMaterial color="#22C55E" />
      </mesh>
      <mesh position={[position[0] - 0.15, position[1] + 0.1, position[2] + 0.25]}>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[position[0] + 0.15, position[1] + 0.1, position[2] + 0.25]}>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </group>
  )
}

// Player character
function Player({ onPositionChange, joystickRef, onJump }) {
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position: [0, 1, 0],
    args: [0.5],
    fixedRotation: true
  }))
  
  const velocity = useRef([0, 0, 0])
  const position = useRef([0, 1, 0])
  const canJump = useRef(true)
  const isGrounded = useRef(true)
  
  useEffect(() => {
    const unsubscribeVelocity = api.velocity.subscribe((v) => (velocity.current = v))
    const unsubscribePosition = api.position.subscribe((p) => (position.current = p))
    return () => {
      unsubscribeVelocity()
      unsubscribePosition()
    }
  }, [api])
  
  // Check if grounded
  useFrame(() => {
    // If y velocity is near 0, we're grounded
    isGrounded.current = Math.abs(velocity.current[1]) < 0.1
  })
  
  // Jump function
  const jump = () => {
    if (isGrounded.current && canJump.current) {
      api.velocity.set(velocity.current[0], 8, velocity.current[2])
      canJump.current = false
      setTimeout(() => {
        canJump.current = true
      }, 500)
    }
  }
  
  // Expose jump to parent
  useEffect(() => {
    if (onJump) {
      onJump(jump)
    }
  }, [onJump])
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const speed = 10
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          api.velocity.set(velocity.current[0], velocity.current[1], -speed)
          break
        case 's':
        case 'arrowdown':
          api.velocity.set(velocity.current[0], velocity.current[1], speed)
          break
        case 'a':
        case 'arrowleft':
          api.velocity.set(-speed, velocity.current[1], velocity.current[2])
          break
        case 'd':
        case 'arrowright':
          api.velocity.set(speed, velocity.current[1], velocity.current[2])
          break
        case ' ':
          e.preventDefault()
          jump()
          break
      }
    }
    
    const handleKeyUp = (e) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 's':
        case 'arrowup':
        case 'arrowdown':
          api.velocity.set(velocity.current[0], velocity.current[1], 0)
          break
        case 'a':
        case 'd':
        case 'arrowleft':
        case 'arrowright':
          api.velocity.set(0, velocity.current[1], velocity.current[2])
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [api])
  
  useFrame(() => {
    if (onPositionChange) {
      onPositionChange([...position.current])
    }
    
    // Apply joystick movement if active
    if (joystickRef && (joystickRef.current.x !== 0 || joystickRef.current.z !== 0)) {
      const speed = 10
      api.velocity.set(
        joystickRef.current.x * speed,
        velocity.current[1],
        joystickRef.current.z * speed
      )
    }
    
    // Keep player within bounds
    const bounds = 7
    if (position.current[0] < -bounds) {
      api.position.set(-bounds, position.current[1], position.current[2])
    }
    if (position.current[0] > bounds) {
      api.position.set(bounds, position.current[1], position.current[2])
    }
    if (position.current[2] < -bounds) {
      api.position.set(position.current[0], position.current[1], -bounds)
    }
    if (position.current[2] > bounds) {
      api.position.set(position.current[0], position.current[1], bounds)
    }
  })
  
  return (
    // Hide the sphere, show only the monster
    <Monster position={position.current} />
  )
}

// Gem component
function Gem({ position, onCollect, isCorrect, playerPosition }) {
  const [ref, api] = useSphere(() => ({
    mass: 0,
    position: position,
    args: [0.5],
    isTrigger: true
  }))
  
  const [collected, setCollected] = useState(false)
  const gemPos = useRef(position)
  
  useEffect(() => {
    const unsubscribe = api.position.subscribe((p) => {
      gemPos.current = p
    })
    return unsubscribe
  }, [api])
  
  // Check distance to player every frame
  useFrame(() => {
    if (collected || !playerPosition) return
    
    const dx = gemPos.current[0] - playerPosition[0]
    const dy = gemPos.current[1] - playerPosition[1]
    const dz = gemPos.current[2] - playerPosition[2]
    const distance = Math.sqrt(dx*dx + dy*dy + dz*dz)
    
    // If player is close enough, collect the gem
    if (distance < 1.0) {
      setCollected(true)
      onCollect(isCorrect)
    }
  })
  
  useFrame((state) => {
    if (ref.current && !collected) {
      // Floating animation
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2
    }
  })
  
  if (collected) return null
  
  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[0.3]} />
      <meshStandardMaterial 
        color="#8B5CF6" 
        emissive="#8B5CF6"
        emissiveIntensity={0.5} 
      />
    </mesh>
  )
}

// Word platform
function WordPlatform({ position, word, isCorrect, onSelect, playerPosition }) {
  const [ref] = useBox(() => ({
    mass: 0,
    position: [position[0], position[1], position[2]],
    args: [2, 0.3, 2],
    type: 'Static'
  }))
  
  const [hovered, setHovered] = useState(false)
  const platformPos = useRef(position)
  
  // Check distance to player for collision
  useFrame(() => {
    if (!playerPosition) return
    
    const dx = position[0] - playerPosition[0]
    const dz = position[2] - playerPosition[2]
    const distance = Math.sqrt(dx*dx + dz*dz)
    
    // If player is on the platform (close horizontally and slightly above), select it
    if (distance < 1.0 && playerPosition[1] > position[1] && playerPosition[1] < position[1] + 1.5) {
      onSelect(word, isCorrect)
    }
  })
  
  return (
    <group>
      <mesh 
        ref={ref}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onSelect(word, isCorrect)}
      >
        <boxGeometry args={[2, 0.2, 2]} />
        <meshStandardMaterial color={hovered ? "#FFD23F" : "#8B5CF6"} />
      </mesh>
      <Text
        position={[position[0], position[1] + 0.5, position[2]]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {word}
      </Text>
    </group>
  )
}

// 3D Scene
function Scene({ onPositionChange, joystickRef, onJump }) {
  const words = useGameStore((state) => state.words)
  const currentWordIndex = useGameStore((state) => state.currentWordIndex)
  const answerMultipleChoice = useGameStore((state) => state.answerMultipleChoice)
  const multipleChoiceOptions = useGameStore((state) => state.multipleChoiceOptions)
  const [playerPos, setPlayerPos] = useState([0, 1, 0])
  
  const currentWord = words[currentWordIndex]
  
  // Generate gem positions in a circle
  const gemPositions = useMemo(() => {
    const positions = []
    const radius = 3
    multipleChoiceOptions.forEach((option, index) => {
      const angle = (index / multipleChoiceOptions.length) * Math.PI * 2
      positions.push({
        position: [
          Math.cos(angle) * radius,
          0.2,
          Math.sin(angle) * radius
        ],
        word: option,
        isCorrect: option === currentWord?.word
      })
    })
    return positions
  }, [multipleChoiceOptions, currentWord])
  
  const handleCollect = (isCorrect) => {
    if (isCorrect) {
      // Get the word that was collected
      const correctGem = gemPositions.find(g => g.isCorrect)
      if (correctGem) {
        answerMultipleChoice(correctGem.word)
      }
    } else {
      answerMultipleChoice('')
    }
  }
  
  const handleSelect = (word, isCorrect) => {
    answerMultipleChoice(word)
  }
  
  return (
    <Physics gravity={[0, -10, 0]}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      
      <Floor />
      <Player onPositionChange={onPositionChange} joystickRef={joystickRef} onJump={onJump} />
      
      {/* Word platforms around the player */}
      {/* Gems and platforms */}
      {gemPositions.map((gem, index) => (
        <group key={index}>
          <Gem
            position={gem.position}
            word={gem.word}
            isCorrect={gem.isCorrect}
            onCollect={handleCollect}
            playerPosition={playerPos}
          />
          <WordPlatform
            position={gem.position}
            word={gem.word}
            isCorrect={gem.isCorrect}
            onSelect={handleSelect}
            playerPosition={playerPos}
          />
        </group>
      ))}
    </Physics>
  )
}

// HUD Overlay
function HUD() {
  const score = useGameStore((state) => state.score)
  const lives = useGameStore((state) => state.lives)
  const currentQuestion = useGameStore((state) => state.currentQuestion)
  const currentWordIndex = useGameStore((state) => state.currentWordIndex)
  const words = useGameStore((state) => state.words)
  const goToMenu = useGameStore((state) => state.goToMenu)
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
        {/* Score */}
        <div className="bg-brawl-dark-light/80 rounded-xl px-4 py-2 border-2 border-brawl-yellow">
          <span className="text-brawl-yellow font-bold text-xl">⭐ {score}</span>
        </div>
        
        {/* Lives */}
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <span key={i} className={`text-2xl ${i < lives ? '❤️' : '💔'}`}>
              {i < lives ? '❤️' : '💔'}
            </span>
          ))}
        </div>
        
        {/* Back button */}
        <button
          onClick={goToMenu}
          className="pointer-events-auto px-4 py-2 bg-brawl-dark-light/80 rounded-xl border-2 border-white text-white font-bold"
        >
          ← Menu
        </button>
      </div>
      
      {/* Question */}
      <div className="absolute bottom-4 right-4 bg-brawl-dark-light/90 rounded-2xl px-4 py-3 border-4 border-brawl-blue max-w-sm">
        <div className="text-white text-center">
          <div className="text-lg opacity-80 mb-1">Vind het juiste woord:</div>
          <div className="text-2xl font-bold text-brawl-yellow">
            "{currentQuestion?.definition}"
          </div>
          <div className="text-sm opacity-60 mt-2">
            {currentWordIndex + 1} / {words.length}
          </div>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-brawl-dark-light/80 rounded-xl px-4 py-2">
        <span className="text-white text-sm">
          Spring met SPATIE of TAP • Loop naar een woord
        </span>
      </div>
    </div>
  )
}

// Touch joystick component
function TouchJoystick({ onMove }) {
  const joystickRef = useRef(null)
  const knobRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    const handleStart = (e) => {
      const touch = e.touches ? e.touches[0] : e
      const rect = joystickRef.current?.getBoundingClientRect()
      if (rect) {
        setStartPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
        setIsDragging(true)
      }
    }
    
    const handleMove = (e) => {
      if (!isDragging) return
      const touch = e.touches ? e.touches[0] : e
      const deltaX = touch.clientX - startPos.x
      const deltaY = touch.clientY - startPos.y
      
      // Clamp to joystick bounds
      const maxRadius = 50
      const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), maxRadius)
      const angle = Math.atan2(deltaY, deltaX)
      
      const clampedX = Math.cos(angle) * distance
      const clampedY = Math.sin(angle) * distance
      
      if (knobRef.current) {
        knobRef.current.style.transform = `translate(${clampedX}px, ${clampedY}px)`
      }
      
      // Normalize and send movement
      onMove({
        x: clampedX / maxRadius,
        z: clampedY / maxRadius
      })
    }
    
    const handleEnd = () => {
      setIsDragging(false)
      if (knobRef.current) {
        knobRef.current.style.transform = 'translate(0px, 0px)'
      }
      onMove({ x: 0, z: 0 })
    }
    
    const joystick = joystickRef.current
    if (joystick) {
      joystick.addEventListener('touchstart', handleStart)
      joystick.addEventListener('mousedown', handleStart)
    }
    
    window.addEventListener('touchmove', handleMove)
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('touchend', handleEnd)
    window.addEventListener('mouseup', handleEnd)
    
    return () => {
      if (joystick) {
        joystick.removeEventListener('touchstart', handleStart)
        joystick.removeEventListener('mousedown', handleStart)
      }
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('touchend', handleEnd)
      window.removeEventListener('mouseup', handleEnd)
    }
  }, [isDragging, startPos, onMove])
  
  return (
    <div 
      ref={joystickRef}
      className="w-32 h-32 rounded-full bg-brawl-dark-light/50 border-4 border-white/30 absolute bottom-8 left-8"
    >
      <div 
        ref={knobRef}
        className="w-16 h-16 rounded-full bg-brawl-orange border-4 border-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform"
      />
    </div>
  )
}

// Main Level1 Screen
export default function Level1Screen() {
  const [playerPos, setPlayerPos] = useState([0, 1, 0])
  const joystickRef = useRef({ x: 0, z: 0 })
  const jumpRef = useRef(null)
  
  const handlePlayerPosChange = (pos) => {
    setPlayerPos(pos)
  }
  
  const handleJump = (jumpFn) => {
    jumpRef.current = jumpFn
  }
  
  // Handle tap/click for jump
  useEffect(() => {
    const handleTap = (e) => {
      // Don't jump if clicking on UI elements
      if (e.target.closest('button') || e.target.closest('.joystick-zone')) return
      
      // Jump on tap/click
      if (jumpRef.current) {
        jumpRef.current()
      }
    }
    
    window.addEventListener('touchstart', handleTap)
    window.addEventListener('click', handleTap)
    
    return () => {
      window.removeEventListener('touchstart', handleTap)
      window.removeEventListener('click', handleTap)
    }
  }, [])
  
  return (
    <div className="w-full h-full relative">
      <Canvas shadows camera={{ position: [0, 8, 10], fov: 50 }}>
        <color attach="background" args={['#87CEEB']} />
        <Scene onPositionChange={handlePlayerPosChange} joystickRef={joystickRef} onJump={handleJump} />
      </Canvas>
      <HUD />
      <TouchJoystick onMove={(dir) => {
        joystickRef.current = dir
      }} />
    </div>
  )
}
