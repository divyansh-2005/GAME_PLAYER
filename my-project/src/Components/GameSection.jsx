import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const GameSection = () => {
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
      description: "Play a classic game of Chess against friend!",
      link: "/chessgame",
    },
    {
      name: "Rocket Boost",
      description: "Challenge to Controll rocket with speed boost!",
      link: "/rocketboost",
    },
    {

      name: "endless Runner",
      description: " This is a fun, simple game where you control a chicken navigating through obstacles. The game ends when the chicken collides with an obstacle. ",
      link: "/endless-runner",
    },
    {
      

      name: "Dice Roller",
      description: "The simulator mimics the action of rolling a dice, providing a random outcome between 1 and 6 each time the user interacts with the interface",
      link: "/dice-roller",
    },

    {name: "Flappy Bird",

      description:
        "Navigate the bird through pipes and test your reflexes in this classic Flappy Bird game!",
      link: "/flappybird",

    },

    {
      name: "Arkanoid",
      description:
        "The player is tasked with clearing a formation of colorful blocks by deflecting a ball towards it without letting the ball leave the bottom edge of the playfield.",
      link: "/arkanoid",
    },
    {
      name: "Whack A Mole",
      description:
        "This game provides the fun and fast-paced action of clicking moles as they pop up, with clear instructions and smooth interactions.",
      link: "/whack-a-mole",
    },



    {
      name: "Color Memo",
      description:
        "The Memory Game with Colors challenges players to remember and match sequences of colors, improving their focus and memory skills through engaging gameplay.",
      link: "/colormemo",
    },{
      name: "Aim Shooter",
      description:
        "This game offers an enjoyable experience where players can enhance their shooting skills.",
      link: "/aimshooter",
    },{
      name: "Candy Crush Saga",
      description:
        "Candy Crush Saga is a popular match-three puzzle game where players swap colorful candies to create matches, clear levels, and earn points.",
      link: "/candycrush",
    },

    {
      name: "Dice Game Tenzi",
      description:
        "Roll, match, and race to victory in the fast-paced, addictive fun of Tenzi—can you be the first to roll all ten dice the same?",
      link: "/dicegame",
    },
    {
        name: "DuckHunt",
        description:
          "The main goal is to shoot as many ducks as possible before they disappear. Players have a limited number of misses; missing three ducks results in game over",
        link: "/duckhunt",
      },
      {
        name: "MemoryCard Game",
        description:
          "A game where players flip over two cards at a time, trying to find matching pairs. The game continues until all pairs are found.",
        link: "/memorycardgame",
      },
      {
        name: "Checkers",
        description:
          "A two-player board game where players move pieces diagonally across a board with the goal of capturing the opponent’s pieces.",
        link: "/checkers",
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
    navigate(link); // Navigate directly to the game's route
  };

  return (
    <div className="container" id="games">
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
};

export default GameSection;
