import React, { useEffect, useState } from "react";
import axios from "axios";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get("/api/leaderboard");
        setLeaderboard(response.data);
      } catch (error) {
        console.error("Error fetching leaderboard", error);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="leaderboard">
      <h1>Leaderboard</h1>
      <ul>
        {leaderboard.map((user, index) => (
          <li key={user._id}>
            <strong>{index + 1}. {user.name}</strong> - {user.points} points
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
