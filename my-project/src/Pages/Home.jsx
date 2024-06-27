import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-400 to-purple-600 text-white p-4 md:p-8">
      <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center">Welcome to GameZone</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full max-w-screen-lg overflow-y-auto">
        <Link
          to="/gth"
          className="home-link bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-700 hover:to-purple-900 transition duration-300 ease-in-out flex flex-col items-center justify-center py-4 px-6 rounded-lg shadow-lg text-center"
        >
          <i className="fas fa-palette text-3xl md:text-4xl mb-2 text-purple-300"></i>
          <span className="text-lg md:text-xl font-semibold">Guess the Hex</span>
        </Link>
        <Link
          to="/flipcard"
          className="home-link bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-600 hover:to-blue-800 transition duration-300 ease-in-out flex flex-col items-center justify-center py-4 px-6 rounded-lg shadow-lg text-center"
        >
          <i className="fas fa-gamepad text-3xl md:text-4xl mb-2 text-blue-300"></i>
          <span className="text-lg md:text-xl font-semibold">Flip Card Game</span>
        </Link>
        <Link
          to="/snakegame"
          className="home-link bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-700 hover:to-purple-900 transition duration-300 ease-in-out flex flex-col items-center justify-center py-4 px-6 rounded-lg shadow-lg text-center"
        >
          <i className="fas fa-snake text-3xl md:text-4xl mb-2 text-purple-300"></i>
          <span className="text-lg md:text-xl font-semibold">Snake Game</span>
        </Link>
        <Link
          to="/emojiintruder"
          className="home-link bg-gradient-to-b from-yellow-300 to-yellow-500 hover:from-yellow-500 hover:to-yellow-700 transition duration-300 ease-in-out flex flex-col items-center justify-center py-4 px-6 rounded-lg shadow-lg text-center"
        >
          <i className="fas fa-laugh text-3xl md:text-4xl mb-2 text-yellow-200"></i>
          <span className="text-lg md:text-xl font-semibold">Emoji Intruder</span>
        </Link>
        <Link
          to="/rckpapsc"
          className="home-link bg-gradient-to-b from-red-400 to-red-600 hover:from-red-600 hover:to-red-800 transition duration-300 ease-in-out flex flex-col items-center justify-center py-4 px-6 rounded-lg shadow-lg text-center"
        >
          <i className="fas fa-memory text-3xl md:text-4xl mb-2 text-red-300"></i>
          <span className="text-lg md:text-xl font-semibold">RockPaper Scissors</span>
        </Link>
      </div>
    </div>
  );
};

export default Home;
