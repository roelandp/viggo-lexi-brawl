import { create } from 'zustand'
import wordsData from '../data/words.json'
import { playSound, playBackgroundMusic, stopBackgroundMusic } from '../utils/sounds'

export const useGameStore = create((set, get) => ({
  // Game state
  currentScreen: 'menu', // menu, level1, level2, victory
  selectedToets: null,
  currentWordIndex: 0,
  score: 0,
  lives: 3,
  
  // Words data
  words: [],
  
  // Player position
  playerPosition: [0, 1, 0],
  
  // Current word for multiple choice
  currentQuestion: null,
  multipleChoiceOptions: [],
  
  // Typing answer
  typedAnswer: '',
  
  // Actions
  selectToets: (toetsId) => {
    const toetsData = wordsData[toetsId]
    if (toetsData) {
      playSound('gameStart')
      // Randomize the order of questions
      const shuffledQuestions = [...toetsData.questions].sort(() => Math.random() - 0.5)
      set({
        selectedToets: toetsId,
        words: shuffledQuestions,
        currentWordIndex: 0,
        score: 0,
        lives: 3,
        currentScreen: 'levelSelect'
      })
    }
  },
  
  startLevel1: () => {
    const { words, currentWordIndex } = get()
    if (words.length > 0) {
      const currentWord = words[currentWordIndex]
      const options = get().generateMultipleChoice(currentWord)
      playBackgroundMusic(1)
      set({
        currentScreen: 'level1',
        currentQuestion: currentWord,
        multipleChoiceOptions: options,
        typedAnswer: ''
      })
    }
  },
  
  startLevel2: () => {
    const { words, currentWordIndex } = get()
    if (words.length > 0) {
      const currentWord = words[currentWordIndex]
      playBackgroundMusic(2)
      set({
        currentScreen: 'level2',
        currentQuestion: currentWord,
        typedAnswer: ''
      })
    }
  },
  
  generateMultipleChoice: (currentWord) => {
    const { words } = get()
    // Get 3 random wrong answers
    const wrongAnswers = words
      .filter(w => w.word !== currentWord.word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(w => w.word)
    
    // Combine with correct answer and shuffle
    const options = [...wrongAnswers, currentWord.word]
    return options.sort(() => Math.random() - 0.5)
  },
  
  answerMultipleChoice: (answer) => {
    const { currentQuestion, score, words, currentWordIndex } = get()
    
    if (answer === currentQuestion.word) {
      playSound('correct')
      // Correct answer
      const newScore = score + 10
      const newIndex = currentWordIndex + 1
      
      if (newIndex >= words.length) {
        // Level complete
        stopBackgroundMusic()
        playSound('victory')
        set({ score: newScore, currentScreen: 'victory' })
      } else {
        // Next word
        const nextWord = words[newIndex]
        const options = get().generateMultipleChoice(nextWord)
        set({
          score: newScore,
          currentWordIndex: newIndex,
          currentQuestion: nextWord,
          multipleChoiceOptions: options
        })
      }
    } else {
      // Wrong answer
      playSound('wrong')
      const newLives = get().lives - 1
      if (newLives <= 0) {
        stopBackgroundMusic()
        playSound('gameOver')
        set({ lives: 0, currentScreen: 'gameOver' })
      } else {
        set({ lives: newLives })
      }
    }
  },
  
  answerTyping: (answer) => {
    const { currentQuestion, score, words, currentWordIndex } = get()
    const normalizedAnswer = answer.toLowerCase().trim()
    const normalizedWord = currentQuestion.word.toLowerCase().trim()
    
    if (normalizedAnswer === normalizedWord) {
      playSound('correct')
      // Correct answer
      const newScore = score + 15
      const newIndex = currentWordIndex + 1
      
      if (newIndex >= words.length) {
        // Level complete
        stopBackgroundMusic()
        playSound('victory')
        set({ score: newScore, currentScreen: 'victory' })
      } else {
        // Next word
        const nextWord = words[newIndex]
        set({
          score: newScore,
          currentWordIndex: newIndex,
          currentQuestion: nextWord,
          typedAnswer: ''
        })
      }
    } else {
      // Wrong answer
      playSound('wrong')
      const newLives = get().lives - 1
      if (newLives <= 0) {
        stopBackgroundMusic()
        playSound('gameOver')
        set({ lives: 0, currentScreen: 'gameOver' })
      } else {
        set({ lives: newLives, typedAnswer: '' })
      }
    }
  },
  
  setTypedAnswer: (answer) => set({ typedAnswer: answer }),
  
  setPlayerPosition: (position) => set({ playerPosition: position }),
  
  goToMenu: () => {
    stopBackgroundMusic()
    set({
      currentScreen: 'menu',
      selectedToets: null,
      words: [],
      currentWordIndex: 0,
      score: 0,
      lives: 3,
      currentQuestion: null,
      typedAnswer: ''
    })
  },
  
  restartGame: () => {
    const { selectedToets } = get()
    if (selectedToets) {
      get().selectToets(selectedToets)
    } else {
      get().goToMenu()
    }
  }
}))
