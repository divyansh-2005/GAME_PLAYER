import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const GameSection = () => {
  const [games, setGames] = useState([
    {
      name: "Guess the Hex",
      description: "Description of Game A",
      link: "/gth",
    },
    {
      name: "Flip Card Game",
      description: "Description of Game B",
      link: "/flipcard",
    },
    {
      name: "Snake Game",
      description: "Description of Game C",
      link: "/snakegame",
    },
    {
      name: "Emoji Intruder",
      description: "Description of Game D",
      link: "/emojiintruder",
    },
    {
      name: "RockPaper Scissors",
      description: "Description of Game E",
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
