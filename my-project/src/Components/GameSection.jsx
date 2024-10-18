import React, { useState, forwardRef } from "react";
import { useNavigate } from "react-router-dom";

const GameSection = forwardRef((props, ref) => {
  const [games, setGames] = useState([
    { name: "Guess the Hex", description: "Match the Hex code to its perfect color card!", link: "/gth" },
    { name: "Flip Card Game", description: "Find the matching pair of cards!", link: "/flipcard" },
    { name: "Snake Game", description: "Guide the snake to gobble up as many boxes as possible!", link: "/snakegame" },
    { name: "Emoji Intruder", description: "Spot the sneaky emoji among identical faces!", link: "/emojiintruder" },
    { name: "Rock Paper Scissors", description: "Challenge the computer in this classic game!", link: "/rckpapsc" },
    { name: "Ping Pong Game", description: "Challenge your reflexes in this fast-paced game!", link: "/pingpong" },
    { name: "Simon Says", description: "Repeat the sequence of colors as it gets harder!", link: "/simon-says" },
    { name: "Hangman", description: "Guess letters or the whole word based on clues!", link: "/word-guessing-game" },
    { name: "Chess Game", description: "Play a classic game of Chess against a friend!", link: "/chessgame" },
    { name: "Rocket Boost", description: "Control the rocket with speed boost!", link: "/rocketboost" },
    { name: "Endless Runner", description: "Control a chicken navigating through obstacles!", link: "/endless-runner" },
    { name: "Dice Roller", description: "Roll a dice and get a random outcome!", link: "/dice-roller" },
    { name: "Flappy Bird", description: "Navigate the bird through pipes in this classic game!", link: "/flappybird" },
    { name: "Arkanoid", description: "Clear blocks by deflecting a ball towards them!", link: "/arkanoid" },
    { name: "Whack A Mole", description: "Click moles as they pop up for fast-paced fun!", link: "/whack-a-mole" },
    { name: "Color Memo", description: "Match sequences of colors in this memory game!", link: "/colormemo" },
    { name: "Aim Shooter", description: "Enhance your shooting skills in this fun game!", link: "/aimshooter" },
    { name: "Candy Crush Saga", description: "Swap candies to create matches in this puzzle game!", link: "/candycrush" },
    { name: "Dice Game Tenzi", description: "Be the first to roll all ten dice the same!", link: "/dicegame" },
    { name: "DuckHunt", description: "Shoot as many ducks as possible before they disappear!", link: "/duckhunt" },
    { name: "Tower of Hanoi", description: "Move a stack of disks between rods in this puzzle game!", link: "/towerofhanoi" },
    { name: "Battleship", description: "Strategically sink your opponent's ships!", link: "/battleship" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(searchTerm)
  );

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
                <button onClick={() => handleNavigate(game.link)}>Play</button>
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
