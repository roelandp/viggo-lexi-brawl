import { useGameStore } from './store/gameStore'
import MenuScreen from './components/MenuScreen'
import LevelSelectScreen from './components/LevelSelectScreen'
import Level1Screen from './components/Level1Screen'
import Level2Screen from './components/Level2Screen'
import VictoryScreen from './components/VictoryScreen'
import GameOverScreen from './components/GameOverScreen'

function App() {
  const currentScreen = useGameStore((state) => state.currentScreen)
  
  // Render the appropriate screen
  switch (currentScreen) {
    case 'menu':
      return <MenuScreen />
    case 'levelSelect':
      return <LevelSelectScreen />
    case 'level1':
      return <Level1Screen />
    case 'level2':
      return <Level2Screen />
    case 'victory':
      return <VictoryScreen />
    case 'gameOver':
      return <GameOverScreen />
    default:
      return <MenuScreen />
  }
}

export default App
