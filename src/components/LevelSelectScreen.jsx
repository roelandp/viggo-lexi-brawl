import { useGameStore } from '../store/gameStore'
import wordsData from '../data/words.json'

export default function LevelSelectScreen() {
  const selectedToets = useGameStore((state) => state.selectedToets)
  const startLevel1 = useGameStore((state) => state.startLevel1)
  const startLevel2 = useGameStore((state) => state.startLevel2)
  const goToMenu = useGameStore((state) => state.goToMenu)
  
  const toetsData = wordsData[selectedToets]
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-brawl-dark to-brawl-dark-light overflow-hidden">
      {/* Back button */}
      <button
        onClick={goToMenu}
        className="absolute top-4 left-4 px-4 py-2 bg-brawl-dark-light rounded-lg border-2 border-white text-white font-bold"
      >
        ← Terug
      </button>
      
      {/* Title */}
      <h1 className="text-4xl md:text-6xl font-bold text-brawl-yellow mb-4" style={{ fontFamily: 'Fredoka, cursive' }}>
        {toetsData?.title || 'Selecteer Level'}
      </h1>
      
      <p className="text-white text-lg md:text-xl mb-12 opacity-80">
        {toetsData?.questions?.length} woordjes om te leren
      </p>
      
      {/* Level Buttons */}
      <div className="flex flex-col gap-8">
        {/* Level 1 - Exploration */}
        <button
          onClick={startLevel1}
          className="group relative px-16 py-8 bg-gradient-to-r from-brawl-blue to-brawl-purple rounded-3xl 
                     border-4 border-white text-white transition-all duration-200
                     hover:scale-105 active:scale-95 shadow-xl"
          style={{ fontFamily: 'Fredoka, cursive' }}
        >
          <div className="text-3xl font-bold mb-2">Level 1</div>
          <div className="text-xl opacity-90">✨ Verken & Verzamel</div>
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-brawl-yellow rounded-full flex items-center justify-center text-2xl">
            💎
          </div>
        </button>
        
        {/* Level 2 - Boss Gate */}
        <button
          onClick={startLevel2}
          className="group relative px-16 py-8 bg-gradient-to-r from-brawl-pink to-brawl-orange rounded-3xl 
                     border-4 border-white text-white transition-all duration-200
                     hover:scale-105 active:scale-95 shadow-xl"
          style={{ fontFamily: 'Fredoka, cursive' }}
        >
          <div className="text-3xl font-bold mb-2">Level 2</div>
          <div className="text-xl opacity-90">🏰 De Bospoort</div>
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-brawl-orange rounded-full flex items-center justify-center text-2xl">
            🔒
          </div>
        </button>
      </div>
      
      {/* Instructions */}
      <div className="mt-12 p-6 bg-brawl-dark-light rounded-2xl border-2 border-brawl-blue max-w-md">
        <h3 className="text-white font-bold text-lg mb-2">📖 Hoe speel je?</h3>
        <ul className="text-white opacity-80 text-sm space-y-1">
          <li>• Level 1: Loop naar de juiste vertaling</li>
          <li>• Level 2: Typ het juiste woord</li>
          <li>• Verdien punten en red levens!</li>
        </ul>
      </div>
    </div>
  )
}
