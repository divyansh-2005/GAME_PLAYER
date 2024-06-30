import React, { useState, useEffect, createContext, useContext } from "react";
import { retrieveLaunchParams, SDKProvider } from "@tma.js/sdk-react";
import axios from "axios";

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
      await saveTelegramUserToDatabase(user);
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTelegramUserToDatabase = async (user) => {
    try {
      await axios.post(
        "http://localhost:3000/api/user/save",
        {
          name: `${user.firstName} ${user.lastName}`,
          telegramId: user.id,
          username: `${user.firstName.toLowerCase()}${user.lastName.toLowerCase()}`,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          maxBodyLength: Infinity,
        }
      );
    } catch (error) {
      setIsError(true);
      console.error("Error saving user to database:", error);
    }
  };

  return (
    <SDKProvider>
      <TmaContext.Provider value={{ user: telegramUser, isLoading, isError }}>
        {children}
      </TmaContext.Provider>
    </SDKProvider>
  );
};

// Custom hook to use the TmaContext
export const useTma = () => useContext(TmaContext);

// TheLoadingComponent
const TheLoadingComponent = () => {
  return <div>Loading...</div>;
};

// TheErrorComponent
const TheErrorComponent = () => {
  return <div>This app opens only in Telegram mini app</div>;
};
