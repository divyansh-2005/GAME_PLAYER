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
import SimonSays from "./Games/SimonSays/SimonSays";
import WordGuessingGame from "./Games/WordGuessingGame/WordGuessingGame";
import RocketBoost from "./Games/RocketBoost/RocketBoost";
import ChessGame from "./Games/ChessGame/ChessGame";
import FlappyBird from "./Games/FlappyBirdGame/FlappyBird";
import ArkanoidGame from "./Games/Arkanoid/ArkanoidGame";
import WhackAMole from "./Games/WhackAMole/WhackAMole";

const App = () => {
  const { user, isLoading, isError } = useTma();
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/games" element={<Games />} />
        <Route path="/flipcard" element={<FlipGame />} />
        <Route path="/snakegame" element={<SnakeGame />} />
        <Route path="/gth" element={<GTH />} />
        <Route path="/emojiintruder" element={<EmojiIntruderHunt />} />
        <Route path="/rckpapsc" element={<RockPaperScissors />} />
        <Route path="/PingPong" element={<PongGame />} />
        <Route path="/simon-says" element={<SimonSays />} />
        <Route path="/rocketboost" element={<RocketBoost />} />
        <Route path="/word-guessing-game" element={<WordGuessingGame />} />
        <Route path="/word-guessing-game" element={<WordGuessingGame />} />
        <Route path="/flappybird" element={<FlappyBird />} />
        <Route path="/arkanoid" element={<ArkanoidGame />} />
        <Route path="/addgame" element={<AddGamePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/chessgame" element={<ChessGame />} />
        <Route path="/whack-a-mole" element={<WhackAMole />} />
      </Routes>
    </>
  );
};

export default App;
