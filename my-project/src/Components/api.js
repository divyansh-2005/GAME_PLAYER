// api.js
export async function fetchUserData(telegramId) {
    const response = await fetch(`http://localhost:3000/user/${telegramId}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  }
  