import React, { useContext, useEffect, useState } from 'react';
import { TmaContext } from './Components/tma/context';
import { fetchUserData } from './api';

// api.js
export async function fetchUserData(telegramId) {
  const response = await fetch(`http://localhost:3000/user/${telegramId}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}


function Dashboard() {
  const { user } = useContext(TmaContext);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchUserData(user.id);
        setUserData(data);
      } catch (err) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }

    if (user.id) {
      loadData();
    }
  }, [user.id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Failed to load user data</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.username}</h1>
      <p>Points: {userData.points}</p>
      {/* Add more user data display here */}
    </div>
  );
}

export default Dashboard;
