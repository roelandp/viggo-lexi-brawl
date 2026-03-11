import { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Physics, useBox, usePlane } from '@react-three/cannon'
import { Text, PerspectiveCamera } from '@react-three/drei'
import { useGameStore } from '../store/gameStore'
import { playSound } from '../utils/sounds'

// Gate component (the boss)
function Gate({ isOpen }) {
  const [leftDoorRef] = useBox(() => ({
    mass: 0,
    position: [-3, 2, 0],
    args: [2, 4, 0.5]
  }))
  
  const [rightDoorRef] = useBox(() => ({
    mass: 0,
    position: [3, 2, 0],
    args: [2, 4, 0.5]
  }))
  
  const [leftTarget, setLeftTarget] = useState([-3, 2, 0])
  const [rightTarget, setRightTarget] = useState([3, 2, 0])
  
  useFrame((state, delta) => {
    if (isOpen) {
      // Open doors animation
      setLeftTarget(prev => [
        prev[0] + ( -5 - prev[0]) * delta * 2,
        prev[1],
        prev[2]
      ])
      setRightTarget(prev => [
        prev[0] + (5 - prev[0]) * delta * 2,
        prev[1],
        prev[2]
      ])
    }
  })
  
  return (
    <group>
      {/* Left door */}
      <mesh ref={leftDoorRef} position={leftTarget}>
        <boxGeometry args={[2, 4, 0.5]} />
        <meshStandardMaterial color="#8B5CF6" metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Right door */}
      <mesh ref={rightDoorRef} position={rightTarget}>
        <boxGeometry args={[2, 4, 0.5]} />
        <meshStandardMaterial color="#8B5CF6" metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Gate frame */}
      <mesh position={[0, 4.5, 0]}>
        <boxGeometry args={[7, 1, 0.5]} />
        <meshStandardMaterial color="#FFD23F" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Gate lock symbol */}
      <mesh position={[0, 2, 0.3]}>
        <boxGeometry args={[1, 1, 0.2]} />
        <meshStandardMaterial color={isOpen ? "#22C55E" : "#EF4444"} emissive={isOpen ? "#22C55E" : "#EF4444"} emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

// Ground
function Ground() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0]
  }))
  
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#374151" />
    </mesh>
  )
}

// Decorative pillars
function Pillar({ position }) {
  const [ref] = useBox(() => ({
    mass: 0,
    position: position,
    args: [1, 6, 1]
  }))
  
  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={[1, 6, 1]} />
      <meshStandardMaterial color="#6B7280" />
    </mesh>
  )
}

// Floating particles for atmosphere
function Particles() {
  const particlesRef = useRef()
  const count = 50
  
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20
    positions[i * 3 + 1] = Math.random() * 10
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20
  }
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#FFD23F" transparent opacity={0.8} />
    </points>
  )
}

// 3D Scene
function Scene({ isGateOpen }) {
  return (
    <Physics gravity={[0, -10, 0]}>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={1} castShadow />
      
      <Ground />
      <Gate isOpen={isGateOpen} />
      
      {/* Decorative pillars */}
      <Pillar position={[-6, 3, -2]} />
      <Pillar position={[6, 3, -2]} />
      <Pillar position={[-6, 3, 2]} />
      <Pillar position={[6, 3, 2]} />
      
      <Particles />
    </Physics>
  )
}

// HUD Component
function HUD({ typedAnswer, setTypedAnswer, handleSubmit, isGateOpen, showCorrectAnswer, inputRef, blurInput }) {
  const score = useGameStore((state) => state.score)
  const lives = useGameStore((state) => state.lives)
  const currentQuestion = useGameStore((state) => state.currentQuestion)
  const currentWordIndex = useGameStore((state) => state.currentWordIndex)
  const words = useGameStore((state) => state.words)
  const goToMenu = useGameStore((state) => state.goToMenu)
  const localInputRef = useRef(null)
  
  // Use passed ref or local ref
  const actualRef = inputRef || localInputRef
  
  // Auto-focus input on mount and screen change
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [currentWordIndex])
  
  // Handle virtual keyboard on mobile
  useEffect(() => {
    const handleFocus = () => {
      // Scroll input into view on mobile
      setTimeout(() => {
        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
    
    inputRef.current?.addEventListener('focus', handleFocus)
    return () => {
      inputRef.current?.removeEventListener('focus', handleFocus)
    }
  }, [])
  
  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px'
    }
  }, [typedAnswer])
  
  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Top bar */}
      <div className="p-4 flex justify-between items-start bg-gradient-to-b from-brawl-dark/90 to-transparent">
        {/* Score */}
        <div className="bg-brawl-dark-light/80 rounded-xl px-4 py-2 border-2 border-brawl-yellow">
          <span className="text-brawl-yellow font-bold text-xl">⭐ {score}</span>
        </div>
        
        {/* Lives */}
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <span key={i} className="text-2xl">
              {i < lives ? '❤️' : '💔'}
            </span>
          ))}
        </div>
        
        {/* Back button */}
        <button
          onClick={goToMenu}
          className="px-4 py-2 bg-brawl-dark-light/80 rounded-xl border-2 border-white text-white font-bold"
        >
          ← Menu
        </button>
      </div>
      
      {/* Question display - center of screen */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-brawl-dark-light/95 rounded-3xl px-8 py-6 border-4 border-brawl-orange max-w-lg text-center">
          <div className="text-white text-lg opacity-80 mb-2">Schrijf het woord:</div>
          <div className="text-3xl md:text-4xl font-bold text-brawl-yellow mb-4" style={{ fontFamily: 'Fredoka, cursive' }}>
            "{currentQuestion?.definition}"
          </div>
          <div className="text-sm opacity-60 mb-4">
            Hint: {currentQuestion?.hint}
          </div>
          
          {/* Progress */}
          <div className="text-white opacity-60 text-sm mb-4">
            {currentWordIndex + 1} / {words.length}
          </div>
          
          {/* Show correct answer feedback */}
          {showCorrectAnswer && (
            <div className="mb-4 p-4 bg-red-500/20 rounded-xl border-2 border-red-400">
              <div className="text-red-400 font-bold text-2xl mb-1">
                ✗ Fout!
              </div>
              <div className="text-white text-xl">
                Het juiste antwoord was: <span className="text-green-400 font-bold">{currentQuestion?.word}</span>
              </div>
            </div>
          )}
          
          {/* Input field - school writing style */}
          <div className="relative w-full max-w-md mx-auto">
            {/* Writing line */}
            <div className="relative">
              <textarea
                ref={inputRef}
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (!showCorrectAnswer) handleSubmit()
                  }
                }}
                onBlur={() => {
                  // Keep focus if showing correct answer
                  if (!showCorrectAnswer && typedAnswer === '') {
                    setTimeout(() => inputRef.current?.focus(), 100)
                  }
                }}
                placeholder="Typ hier je antwoord..."
                rows={1}
                disabled={showCorrectAnswer}
                className={`w-full px-4 py-3 text-4xl bg-transparent border-b-4 border-green-400 text-green-400 text-center resize-none overflow-hidden
                           focus:outline-none focus:border-green-300
                           placeholder:text-gray-500 placeholder:text-3xl placeholder:font-normal
                           ${showCorrectAnswer ? 'opacity-50' : ''}`}
                style={{ 
                  fontFamily: 'SchoolschriftLG, Fredoka, cursive',
                  fontWeight: '800',
                  color: '#4ade80',
                  WebkitTextFillColor: '#4ade80',
                  textShadow: '0 0 2px #000000, 0 0 2px #000000, 0 0 10px #4ade80, 0 0 20px #4ade80, 0 0 30px #4ade80',
                  minHeight: '3rem',
                  caretColor: '#4ade80'
                }}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>
            
            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={showCorrectAnswer}
              className={`mt-6 w-full py-4 rounded-xl border-4 border-white 
                         text-white text-xl font-bold transition-all duration-200
                         shadow-lg ${
                           showCorrectAnswer 
                             ? 'bg-gray-500 cursor-not-allowed' 
                             : 'bg-brawl-orange hover:scale-105 hover:bg-brawl-yellow hover:border-brawl-orange active:scale-95'
                         }`}
              style={{ fontFamily: 'Fredoka, cursive' }}
            >
              {showCorrectAnswer ? 'Even wachten...' : 'Controleren ✓'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Gate status indicator */}
      <div className="p-4 flex justify-center">
        <div className={`px-6 py-2 rounded-full text-white font-bold ${
          isGateOpen ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {isGateOpen ? '🚪 Poort open!' : '🔒 Poort gesloten'}
        </div>
      </div>
    </div>
  )
}

// Main Level2 Screen
export default function Level2Screen() {
  const typedAnswer = useGameStore((state) => state.typedAnswer)
  const setTypedAnswer = useGameStore((state) => state.setTypedAnswer)
  const answerTyping = useGameStore((state) => state.answerTyping)
  const currentQuestion = useGameStore((state) => state.currentQuestion)
  const inputRef = useRef(null)
  const [isGateOpen, setIsGateOpen] = useState(false)
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false)
  
  // Gate opens briefly when typing the correct answer
  useEffect(() => {
    if (typedAnswer.toLowerCase().trim() === currentQuestion?.word.toLowerCase().trim()) {
      setIsGateOpen(true)
      setTimeout(() => setIsGateOpen(false), 1500)
    }
  }, [typedAnswer, currentQuestion])
  
  const handleSubmit = () => {
    // Blur input to hide keyboard on iPad
    if (inputRef.current) {
      inputRef.current.blur()
    }
    
    // Check if answer is wrong
    const isCorrect = typedAnswer.toLowerCase().trim() === currentQuestion?.word.toLowerCase().trim()
    
    if (!isCorrect) {
      // First play wrong sound
      playSound('wrong')
      
      // Show correct answer for 3 seconds, then move to next question
      setShowCorrectAnswer(true)
      setTimeout(() => {
        setShowCorrectAnswer(false)
        answerTyping(typedAnswer) // Submit the wrong answer to move forward
      }, 3000)
    } else {
      // Correct answer - submit normally
      answerTyping(typedAnswer)
      setIsGateOpen(false)
    }
  }
  
  return (
    <div className="w-full h-full relative">
      <Canvas shadows>
        <color attach="background" args={['#1a1a2e']} />
        <PerspectiveCamera makeDefault position={[0, 5, 12]} fov={60} />
        <Scene isGateOpen={isGateOpen} />
      </Canvas>
      <HUD 
        typedAnswer={typedAnswer} 
        setTypedAnswer={setTypedAnswer} 
        handleSubmit={handleSubmit}
        isGateOpen={isGateOpen}
        showCorrectAnswer={showCorrectAnswer}
        inputRef={inputRef}
      />
    </div>
  )
}
