import { useEffect, useState } from "react";
import { TmaContext } from "./context";
import { retrieveLaunchParams, SDKProvider } from "@tma.js/sdk-react";
import axios from "axios";

export function TmaProvider({ children }) {
  const [telegramUser, setTelegramUser] = useState({});
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchTelegramUser = async () => {
    try {
      const launchParams = retrieveLaunchParams();
      const telegramUser = launchParams?.initData?.user;
      if (!telegramUser) {
        throw new Error("User not found");
      }
      setTelegramUser(telegramUser);
      await fetchUserFromDatabase(telegramUser);
    } catch (err) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserFromDatabase = async (telegramUser) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/user/fetch",
        { telegramId: telegramUser.id },
        {
          headers: {
            "Content-Type": "application/json",
          }
        }
      );
      setUser(response.data);
      console.log("User fetched from database:", response.data);
    } catch (error) {
      console.error("Error fetching user from database:", error);
      setIsError(true);
    }
  };

  useEffect(() => {
    fetchTelegramUser();
  }, []);

  if (isLoading) {
    return <TheLoadingComponent />;
  }

  if (isError) {
    return <TheErrorComponent />;
  }

  return (
    <SDKProvider>
      <TmaContext.Provider value={{ user }}>
        {children}
      </TmaContext.Provider>
    </SDKProvider>
  );
}

function TheLoadingComponent() {
  return <div>Loading...</div>;
}

function TheErrorComponent() {
  return <div>This app opens only in Telegram mini app</div>;
}
