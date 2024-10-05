import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const GameSection = () => {
  const [games, setGames] = useState([
    {
      name: "Guess the Hex",
      description: "Put your color-matching skills to the test! Match the Hex code to its perfect color card and become the ultimate shade master!",
      link: "/gth",
    },
    {
      name: "Flip Card Game",
      description: "Challenge your memory in this flip card game! Flip two cards at a time, and see if you can find the matching pair. ",
      link: "/flipcard",
    },
    {
      name: "Snake Game",
      description: "Guide the hungry snake with the arrow keys in a race to gobble up as many boxes as you can!ach box boosts your score—how many can you collect without letting the snake crash?",
      link: "/snakegame",
    },
    {
      name: "Emoji Intruder",
      description: "Test your observation skills in this emoji intruder game! Spot the one sneaky, different emoji hiding among a sea of identical faces.",
      link: "/emojiintruder",
    },
    {
      name: "RockPaper Scissors",
      description: "Challenge the computer in the classic game of Rock, Paper, Scissors! Make your move and see if you can outsmart the machine.",
      link: "/rckpapsc",
    },
    {
      name: "PingPong Game",
      description:"Description of Game F",
      link: "PingPong",
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
