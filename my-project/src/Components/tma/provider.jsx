import { useEffect, useState } from "react";
import { TmaContext } from "./context";
import { retrieveLaunchParams, SDKProvider } from "@tma.js/sdk-react";

export function TmaProvider({ children }) {
  const [telegramUser, setTelegramUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  function fetchTelegramUser() {
    try {
      const launchParams = retrieveLaunchParams();
      const user = launchParams?.initData?.user;
      if (!user) {
        throw new Error("User not found");
      }
      setTelegramUser(user);
    } catch (err) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(fetchTelegramUser, []);

  if (isLoading) {
    return <TheLoadingComponent />;
  }

  if (isError) {
    return <TheErrorComponent />;
  }

  return (
    <SDKProvider>
      <TmaContext.Provider value={{ user: telegramUser }}>
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
