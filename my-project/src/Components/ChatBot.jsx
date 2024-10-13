import { useEffect } from 'react';
// here replace the chatbotId with the chatbotid you will be provided
// website: https://www.chatbase.co/auth/signin?redirectedFrom=%2Fdashboard
// the chatbot symbol will automatically come once you put the chatbotID
const ChatBotEmbed = () => {
  useEffect(() => {
    const script1 = document.createElement('script');
    script1.innerHTML = `
      window.embeddedChatbotConfig = {
        chatbotId: "REPLACE_WITH_YOUR_CHATBOT_ID",          
        domain: "www.chatbase.co"
      };
    `;
    document.body.appendChild(script1);

    const script2 = document.createElement('script');
    script2.src = "https://www.chatbase.co/embed.min.js";
    script2.setAttribute('chatbotId', "REPLACE_WITH_YOUR_CHATBOT_ID");
    script2.setAttribute('domain', "www.chatbase.co");
    script2.defer = true;
    document.body.appendChild(script2);

    return () => {
      document.body.removeChild(script1);
      document.body.removeChild(script2);
    };
  }, []);

  return null; // No visual component needed, just embedding scripts.
};

export default ChatBotEmbed;
