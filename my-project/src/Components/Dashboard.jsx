import React, { useContext, useEffect, useState } from 'react';
import { TmaContext } from './tma/context';
import { fetchUserData } from './api'; // A function to fetch user data from your backend

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
