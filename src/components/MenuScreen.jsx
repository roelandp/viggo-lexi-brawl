import { useGameStore } from '../store/gameStore'
import wordsData from '../data/words.json'

export default function MenuScreen() {
  const selectToets = useGameStore((state) => state.selectToets)
  const toetsKeys = Object.keys(wordsData)
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-brawl-dark to-brawl-dark-light overflow-hidden">
      {/* Title */}
      <div className="text-center mb-12 animate-pulse-glow">
        <h1 className="text-6xl md:text-8xl font-bold text-brawl-orange drop-shadow-lg" style={{ fontFamily: 'Fredoka, cursive' }}>
          LEXI
        </h1>
        <h1 className="text-6xl md:text-8xl font-bold text-brawl-yellow drop-shadow-lg" style={{ fontFamily: 'Fredoka, cursive' }}>
          BRAWL
        </h1>
      </div>
      
      {/* Subtitle */}
      <p className="text-white text-xl md:text-2xl mb-12 opacity-80">
        Leer woordjes en word een kampioen!
      </p>
      
      {/* Toets Buttons */}
      <div className="flex flex-col gap-6">
        {toetsKeys.map((key, index) => (
          <button
            key={key}
            onClick={() => selectToets(key)}
            className="group relative px-12 py-6 bg-brawl-blue rounded-2xl border-4 border-white 
                       text-white text-2xl font-bold transition-all duration-200
                       hover:scale-105 hover:bg-brawl-purple hover:border-brawl-yellow
                       active:scale-95 shadow-lg"
            style={{ fontFamily: 'Fredoka, cursive' }}
          >
            <span className="relative z-10">{wordsData[key].title}</span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity" />
          </button>
        ))}
      </div>
      
      {/* Decorative stars */}
      <div className="absolute top-10 left-10 text-yellow-400 text-4xl animate-bounce">★</div>
      <div className="absolute top-20 right-20 text-yellow-400 text-3xl animate-bounce" style={{ animationDelay: '0.5s' }}>★</div>
      <div className="absolute bottom-20 left-20 text-yellow-400 text-2xl animate-bounce" style={{ animationDelay: '1s' }}>★</div>
      <div className="absolute bottom-10 right-10 text-yellow-400 text-3xl animate-bounce" style={{ animationDelay: '1.5s' }}>★</div>
    </div>
  )
}
