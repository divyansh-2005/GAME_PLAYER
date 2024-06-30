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
        throw new Error("User is not found");
      }
      setTelegramUser(user);
      // await fetchTelegramUserfromDatabes(user);
    } catch (err) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }

  // const apiUrl = import.meta.env.VITE_API_KEY;
  // const fetchTelegramUserfromDatabes = async (user) => {
  //   try {
  //     await axios.post(
  //       `${apiUrl}user/save`,
  //       {
  //         name: user.firstName + " " + user.lastName,
  //         telegramId: user.id,
  //         username: user.firstName.toLowerCase() + user.lastName.toLowerCase(),
  //       },
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         maxBodyLength: Infinity,
  //       }
  //     );
  //   } catch (error) {
  //     setIsError(true);
  //     console.error("Error saving user to database:", error);
  //   }
  // };

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