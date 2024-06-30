import React from 'react';
import { useTma } from './tma/hook';

const Dashboard = () => {
  const { user, isLoading, isError } = useTma();

  if (isLoading) {
    return <div style={{ color: 'white' }} >Loading...</div>;
  }

  if (isError) {
    return <div style={{ color: 'white' }}>This app opens only in Telegram mini app</div>;
  }

  if (!user) {
    return <div style={{ color: 'white' }}>No user data available</div>;
  }

  return (
    <div>
      <h1 style={{ color: 'white' }}>Dashboard</h1>
      <p style={{ color: 'white' }}>Name: {user.firstName} {user.lastName}</p>
      <p style={{ color: 'white' }}>Username: {user.username}</p>
      <p style={{ color: 'white' }}>Points: {user.points}</p>
    </div>
  );
};

export default Dashboard;
