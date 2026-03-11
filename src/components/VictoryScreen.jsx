import { useGameStore } from '../store/gameStore'

export default function VictoryScreen() {
  const score = useGameStore((state) => state.score)
  const goToMenu = useGameStore((state) => state.goToMenu)
  const restartGame = useGameStore((state) => state.restartGame)
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-brawl-dark to-brawl-dark-light overflow-hidden">
      {/* Victory Title */}
      <div className="text-center mb-8">
        <div className="text-8xl mb-4 animate-bounce">🏆</div>
        <h1 className="text-5xl md:text-7xl font-bold text-brawl-yellow" style={{ fontFamily: 'Fredoka, cursive' }}>
          GEWONNEN!
        </h1>
      </div>
      
      {/* Score */}
      <div className="bg-brawl-dark-light p-8 rounded-3xl border-4 border-brawl-orange mb-8">
        <div className="text-white text-center">
          <div className="text-lg opacity-80">Jouw Score</div>
          <div className="text-6xl font-bold text-brawl-orange">{score}</div>
        </div>
      </div>
      
      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={restartGame}
          className="px-8 py-4 bg-brawl-blue rounded-2xl border-4 border-white 
                     text-white text-xl font-bold transition-all duration-200
                     hover:scale-105 active:scale-95 shadow-lg"
          style={{ fontFamily: 'Fredoka, cursive' }}
        >
          Opnieuw spelen
        </button>
        
        <button
          onClick={goToMenu}
          className="px-8 py-4 bg-brawl-pink rounded-2xl border-4 border-white 
                     text-white text-xl font-bold transition-all duration-200
                     hover:scale-105 active:scale-95 shadow-lg"
          style={{ fontFamily: 'Fredoka, cursive' }}
        >
          Menu
        </button>
      </div>
      
      {/* Stars decoration */}
      <div className="absolute top-10 left-10 text-yellow-400 text-4xl animate-pulse">⭐</div>
      <div className="absolute top-20 right-20 text-yellow-400 text-3xl animate-pulse" style={{ animationDelay: '0.5s' }}>⭐</div>
      <div className="absolute bottom-20 left-20 text-yellow-400 text-2xl animate-pulse" style={{ animationDelay: '1s' }}>⭐</div>
      <div className="absolute bottom-10 right-10 text-yellow-400 text-3xl animate-pulse" style={{ animationDelay: '1.5s' }}>⭐</div>
    </div>
  )
}
