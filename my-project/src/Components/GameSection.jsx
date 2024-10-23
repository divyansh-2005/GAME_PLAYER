import React, { forwardRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const GameSection = forwardRef((props, ref) => {
  const [games, setGames] = useState([
    {
      name: "Guess the Hex",
      description:
        "Put your color-matching skills to the test! Match the Hex code to its perfect color card and become the ultimate shade master!",
      link: "/gth",
    },
    {
      name: "Flip Card Game",
      description:
        "Challenge your memory in this flip card game! Flip two cards at a time, and see if you can find the matching pair.",
      link: "/flipcard",
    },
    {
      name: "Snake Game",
      description:
        "Guide the hungry snake with the arrow keys in a race to gobble up as many boxes as you can! Each box boosts your score—how many can you collect without letting the snake crash?",
      link: "/snakegame",
    },
    {
      name: "Emoji Intruder",
      description:
        "Test your observation skills in this emoji intruder game! Spot the one sneaky, different emoji hiding among a sea of identical faces.",
      link: "/emojiintruder",
    },
    {
      name: "Rock Paper Scissors",
      description:
        "Challenge the computer in the classic game of Rock, Paper, Scissors! Make your move and see if you can outsmart the machine.",
      link: "/rckpapsc",
    },
    {
      name: "Ping Pong Game",
      description: "Challenge your reflexes in this fast-paced ping pong game!",
      link: "/pingpong",
    },
    {
      name: "Reaction Time",
      description:
        "The Reaction Time Checker game challenges players to test their reflexes by clicking a button as soon as it lights up.",
      link: "/reaction",
    },
    {
      name: "Simon Says",
      description:
        "Test your memory in the classic Simon Says game! Repeat the sequence of colors as it gets progressively harder. Can you keep up?",
      link: "/simon-says",
    },
    {
      name: "Hangman",
      description:
        "Challenge your vocabulary in this exciting word guessing game! Guess letters or the whole word based on clues provided.",
      link: "/word-guessing-game",
    },
    {
      name: "Chess Game",
      description: "Play a classic game of Chess against a friend!",
      link: "/chessgame",
    },
    {
      name: "Rocket Boost",
      description: "Challenge yourself to control a rocket with speed boosts!",
      link: "/rocketboost",
    },
    {
      name: "Endless Runner",
      description:
        "Navigate through obstacles in this fun, simple endless runner game!",
      link: "/endless-runner",
    },
    {
      name: "Dice Roller",
      description:
        "Simulate rolling a dice, providing a random outcome between 1 and 6 each time the user interacts with the interface.",
      link: "/dice-roller",
    },
    {
      name: "Flappy Bird",
      description:
        "Navigate the bird through pipes and test your reflexes in this classic Flappy Bird game!",
      link: "/flappybird",
    },
    {
      name: "Arkanoid",
      description:
        "Clear a formation of colorful blocks by deflecting a ball towards it, without letting the ball leave the bottom edge of the playfield.",
      link: "/arkanoid",
    },
    {
      name: "Whack A Mole",
      description:
        "Fast-paced action game where you click moles as they pop up!",
      link: "/whack-a-mole",
    },
    {
      name: "Lights Out Game",
      description:
        "Dive into the challenging world of Lights Out! Your objective is to turn off all the lights on the grid by clicking on them.",
      link: "/LightsOut",
    },
    {
      name: "Sudoku",
      description:
        "Challenge your mind with Sudoku, the ultimate logic puzzle that’s fun, addictive, and endlessly satisfying!",
      link: "/sudoku",
    },
    {
      name: "Color Memo",
      description:
        "A memory game where players remember and match sequences of colors.",
      link: "/colormemo",
    },
    {
      name: "Aim Shooter",
      description:
        "Improve your shooting skills in this enjoyable aim shooter game.",
      link: "/aimshooter",
    },
    {
      name: "Candy Crush Saga",
      description:
        "Candy Crush Saga is a match-three puzzle game where players swap candies to create matches, clear levels, and earn points.",
      link: "/candycrush",
    },
    {
      name: "Dice Game Tenzi",
      description:
        "Roll, match, and race to victory in the fast-paced fun of Tenzi!",
      link: "/dicegame",
    },
    {
      name: "Slot Machine",
      description:
        "A slot machine game where players spin reels to match symbols and win coins or rewards.",
      link: "/slot-machine-game",
    },
    {
      name: "3D Tetris",
      description:
        "A 3D Tetris game where players manipulate falling blocks to fit them into a three-dimensional grid.",
      link: "/tetrisgame",
    },
    {
      name: "Write Typing Game",
      description:
        "Challenge yourself to improve your typing skills in this engaging game where every word matters!",
      link: "/typing-game",
    },
    {
      name: "DuckHunt",
      description:
        "Shoot as many ducks as possible before they disappear. Miss too many and the game is over!",
      link: "/duckhunt",
    },
    {
      name: "Tower of Hanoi",
      description:
        "A classic puzzle game where players move a stack of disks from one rod to another, following specific rules.",
      link: "/towerofhanoi",
    },
    {
      name: "Memory Card Game",
      description:
        "A game where players flip over two cards at a time, trying to find matching pairs. The game continues until all pairs are found.",
      link: "/memorycard",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(searchTerm)
  );

  const navigate = useNavigate();

  const handleNavigate = (link) => {
    navigate(link);
  };

  return (
    <div className="container" id="games" ref={ref}>
      <div id="searchBar">
        <h1>Search Games</h1>
        <br />
        <div className="search-input-container">
          <input
            className="text-gray-800"
            type="text"
            id="gameSearch"
            placeholder="Enter Game Name"
            onChange={handleSearch}
          />
        </div>
      </div>

      {filteredGames.length > 0 ? (
        filteredGames.map((game, index) => (
          <div className="box" key={index}>
            <div className="content">
              <h2>{game.name}</h2>
              <h3>{game.description}</h3>
              <div className="card-footer">
                <button onClick={() => handleNavigate(game.link)}>PLAY</button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div id="noResults">No results found</div>
      )}
    </div>
  );
});

export default GameSection;
