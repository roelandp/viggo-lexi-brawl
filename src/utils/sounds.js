// Sound utility for game audio
// Sound files located in /public/sounds/

const sounds = {
  gameStart: new Audio('/viggo-lexi-brawl/sounds/game-gamestart.mp3'),
  victory: new Audio('/viggo-lexi-brawl/sounds/game-victory.mp3'),
  gameOver: new Audio('/viggo-lexi-brawl/sounds/game-game-over.mp3'),
  wrong: new Audio('/viggo-lexi-brawl/sounds/game-wrong.mp3'),
  correct: new Audio('/viggo-lexi-brawl/sounds/game-correct.mp3'),
  bgLevel1: new Audio('/viggo-lexi-brawl/sounds/game-bglevel1.mp3'),
  bgLevel2: new Audio('/viggo-lexi-brawl/sounds/game-bglevel2.mp3'),
}

// Configure background music
sounds.bgLevel1.loop = true
sounds.bgLevel2.loop = true
sounds.bgLevel1.volume = 0.3
sounds.bgLevel2.volume = 0.3

// Sound player utility
export const playSound = (soundName) => {
  const sound = sounds[soundName]
  if (sound) {
    sound.currentTime = 0
    sound.play().catch(e => console.log('Sound not found:', soundName))
  }
}

// Background music controls
export const playBackgroundMusic = (level) => {
  // Stop all background music first
  sounds.bgLevel1.pause()
  sounds.bgLevel2.pause()
  
  if (level === 1) {
    sounds.bgLevel1.play().catch(e => console.log('bg-level1.mp3 not found'))
  } else if (level === 2) {
    sounds.bgLevel2.play().catch(e => console.log('bg-level2.mp3 not found'))
  }
}

export const stopBackgroundMusic = () => {
  sounds.bgLevel1.pause()
  sounds.bgLevel2.pause()
}

export default sounds
