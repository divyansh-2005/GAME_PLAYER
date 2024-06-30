import React, { useState, useEffect, createContext, useContext } from "react";
import { retrieveLaunchParams } from "@tma.js/sdk-react";
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
      await fetchTelegramUserfromDatabes(user);
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const apiUrl = import.meta.env.VITE_API_KEY;
  const fetchTelegramUserfromDatabes = async (user) => {
    try {
      await axios.post(
        `${apiUrl}user/save`,
        {
          name: user.firstName + " " + user.lastName,
          telegramId: user.id,
          username: user.firstName.toLowerCase() + user.lastName.toLowerCase(),
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
    <TmaContext.Provider
      value={{ user: telegramUser, isLoading, isError, setIsLoading }}
    >
      {children}
    </TmaContext.Provider>
  );
};

// Custom hook to use the TmaContext
export const useTma = () => useContext(TmaContext);