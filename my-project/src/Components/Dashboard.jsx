import React from 'react';
import { useTma } from './tma/hook';

const Dashboard = () => {
  const { user } = useTma();

  console.log("User from context:", user);

  if (!user) {
    return <div style={{ color: 'white' }}>Loading...</div>;
  }

  return (
    <div>
      <h1 style={{ color: 'white' }}>Dashboard</h1>
      <p style={{ color: 'white' }}>Name: {user.name}</p>
      <p style={{ color: 'white' }}>Username: {user.username}</p>
      <p style={{ color: 'white' }}>Points: {user.points}</p>
    </div>
  );
};

export default Dashboard;
