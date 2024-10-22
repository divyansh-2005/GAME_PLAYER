import { Route, Routes } from "react-router-dom";
import HomePage from "./Components/HomePage";
import FlipGame from "./Games/FlipCard/FlipCard";
import SnakeGame from "./Games/SnakeGame/SnakeGame";
import GTH from "./Games/GuessTheColor/GTH";
import PongGame from "./Games/PingPongGame/PongGame";
import EmojiIntruderHunt from "./Games/EmojiIntruder/EmojiIntruder";
import RockPaperScissors from "./Games/RockPaper Scissors/Game";
import GameSection from "./Components/GameSection";
import Dashboard from "./Components/Dashboard";
import AddGamePage from "./Components/AddGamePage";
import { useTma } from "./Context/tmaProvider";
import Games from "./Components/Games";
import AboutPage from "./Components/AboutPage";
import ContactPage from "./Components/ContactPage";
import Game from "./Games/ReactionTime/Game";
import SimonSays from "./Games/SimonSays/SimonSays";
import EndlessRunner from "./Games/EndlessRunner/EndlessRunner";
import WordGuessingGame from "./Games/WordGuessingGame/WordGuessingGame"; // Adjust the path as needed
import DiceRoller from "./Games/Dice_rolling_simulator/Dice";
import RocketBoost from "./Games/RocketBoost/RocketBoost";
import ChessGame from "./Games/ChessGame/ChessGame";
import FlappyBird from "./Games/FlappyBirdGame/FlappyBird";
import ArkanoidGame from "./Games/Arkanoid/ArkanoidGame";
import WhackAMole from "./Games/WhackAMole/WhackAMole";
import SudokuGame from "./Games/SudokuGame/src/SudokuGame";
import LightsOut from "./Games/LightsOut/LightsOut";
import ColorMemoGame from "./Games/Color-memoGame/ColorMemoGame";
import AimShooterGame from "./Games/Aim-Shooter-Game/AimShooterGame";
import CandyCrushGame from "./Games/Candy-crush-saga/src/CandyCrushGame";
import DiceGameTenzi from "./Games/Dice-Game-Tenzi/src/DiceGameTenzi";
import ClickSpeedTest from "./Games/Click-speed-test/ClickSpeedTest";
import WriteTypingGame from "./Games/Write-Typing-Game/src/WriteTypingGame";
import TetrisGame from "./Games/3D-Tetris-Game/src/TetrisGame";
import SlotMachineGame from "./Games/Slot-Machine-Game/src/SlotMachineGame";
import TowerOfHanoi from "./Games/TowerOfHanoi/TowerOfHanoi";
import DuckHunt from "./Games/DuckHunt/DuckHunt";
import ConnectFour from "./Games/ConnectFour/ConnectFour";
import AnimatedCursor from "react-animated-cursor"
import RealmRush from "./Games/RealmRush/RealmRush";



const App = () => {
  const { user, isLoading, isError } = useTma();
  return (
    <>
     <AnimatedCursor
      innerSize={8}
      outerSize={18}
      color='245, 4, 20'  // RGB equivalent of #f50414
      outerAlpha={0.5}
      innerScale={0.7}
      outerScale={5}
      clickables={[
        'a',
        'input[type="text"]',
        'input[type="email"]',
        'input[type="number"]',
        'input[type="submit"]',
        'input[type="image"]',
        'label[for]',
        'select',
        'textarea',
        'button',
        '.link',
        {
          target: '.custom',
          options: {
            innerSize: 12,
            outerSize: 26,
            color: '255, 255, 255',
            outerAlpha: 0.3,
            innerScale: 0.7,
            outerScale: 8
          }
        }
      ]}
    />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reaction" element={<Game />}></Route>
        <Route path="/games" element={<Games />} />
        <Route path="/flipcard" element={<FlipGame />} />
        <Route path="/snakegame" element={<SnakeGame />} />
        <Route path="/gth" element={<GTH />} />
        <Route path="/emojiintruder" element={<EmojiIntruderHunt />} />
        <Route path="/rckpapsc" element={<RockPaperScissors />} />
        <Route path="/PingPong" element={<PongGame />} />
        <Route path="/simon-says" element={<SimonSays />} />
        <Route path="/rocketboost" element={<RocketBoost />} />
        <Route path="/word-guessing-game" element={<WordGuessingGame />} />{" "}
        {/* Add the new route here */}
        <Route path="/endless-runner" element={<EndlessRunner />} />
        <Route path="/dice-roller" element={<DiceRoller />} />{" "}
        {/* Add the new route here */}
        <Route path="/flappybird" element={<FlappyBird />} />
        <Route path="/arkanoid" element={<ArkanoidGame />} />
        <Route path="/duckhunt" element={<DuckHunt />} />
        <Route path="/addgame" element={<AddGamePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/chessgame" element={<ChessGame />} />
        <Route path="/whack-a-mole" element={<WhackAMole />} />
        <Route path="/sudoku" element={<SudokuGame />} />
        <Route path="/candycrush" element={<CandyCrushGame />} />
        <Route path="/LightsOut" element={<LightsOut />} />
        <Route path="/colormemo" element={<ColorMemoGame />} />
        <Route path="/aimshooter" element={<AimShooterGame />} />
        <Route path="/candycrush" element={<CandyCrushGame />} />
        <Route path="/dicegame" element={<DiceGameTenzi />} />
        <Route path="/click-speed-test" element={<ClickSpeedTest />} />
        <Route path="/tetrisgame" element={<TetrisGame />} />
        <Route path="/slot-machine-game" element={<SlotMachineGame />} />
        <Route path="/typing-game" element={<WriteTypingGame />} />
        <Route path="/towerofhanoi" element={<TowerOfHanoi />} />
        <Route path="/realmrush" element={<RealmRush />} />
        <Route path="/connectFour" element={<ConnectFour />} />
      </Routes>
    </>
  );
};

export default App;
