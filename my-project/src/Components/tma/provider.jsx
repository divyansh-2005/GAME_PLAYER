// provider.jsx
import React, { useState, useEffect, createContext } from "react";
import { retrieveLaunchParams, SDKProvider } from "@tma.js/sdk-react";

// Create a context
const TmaContext = createContext();

// Create a provider component
export const TmaProvider = ({ children }) => {
  const [telegramUser, setTelegramUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetchTelegramUserData();
  }, []);

  const fetchTelegramUserData = async () => {
    setIsLoading(true);
    try {
      const launchParams = retrieveLaunchParams();
      const user = launchParams?.initData?.user;
      if (!user) {
        throw new Error("User not found");
      }
      setTelegramUser(user);
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading user data</div>;
  }

  return (
    <SDKProvider>
      <TmaContext.Provider value={{ user: telegramUser }}>
        {children}
      </TmaContext.Provider>
    </SDKProvider>
  );
};
