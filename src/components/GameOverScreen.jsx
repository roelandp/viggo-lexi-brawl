import { useGameStore } from '../store/gameStore'

export default function GameOverScreen() {
  const score = useGameStore((state) => state.score)
  const goToMenu = useGameStore((state) => state.goToMenu)
  const restartGame = useGameStore((state) => state.restartGame)
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-red-900 to-brawl-dark overflow-hidden">
      {/* Game Over Title */}
      <div className="text-center mb-8">
        <div className="text-8xl mb-4 animate-pulse">😢</div>
        <h1 className="text-5xl md:text-7xl font-bold text-red-500" style={{ fontFamily: 'Fredoka, cursive' }}>
          GAME OVER
        </h1>
      </div>
      
      {/* Score */}
      <div className="bg-brawl-dark-light p-8 rounded-3xl border-4 border-red-500 mb-8">
        <div className="text-white text-center">
          <div className="text-lg opacity-80">Jouw Score</div>
          <div className="text-6xl font-bold text-red-500">{score}</div>
        </div>
      </div>
      
      {/* Encouragement */}
      <p className="text-white text-xl mb-8 opacity-80">
        Niet opgeven! Probeer het opnieuw!
      </p>
      
      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={restartGame}
          className="px-8 py-4 bg-brawl-blue rounded-2xl border-4 border-white 
                     text-white text-xl font-bold transition-all duration-200
                     hover:scale-105 active:scale-95 shadow-lg"
          style={{ fontFamily: 'Fredoka, cursive' }}
        >
          Opnieuw proberen
        </button>
        
        <button
          onClick={goToMenu}
          className="px-8 py-4 bg-brawl-dark-light rounded-2xl border-4 border-white 
                     text-white text-xl font-bold transition-all duration-200
                     hover:scale-105 active:scale-95 shadow-lg"
          style={{ fontFamily: 'Fredoka, cursive' }}
        >
          Menu
        </button>
      </div>
    </div>
  )
}
