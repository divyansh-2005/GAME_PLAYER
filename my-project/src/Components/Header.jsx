import { useState } from "react";
import { CiSearch } from "react-icons/ci";
import { IoMoonOutline } from "react-icons/io5";
import { HiSun } from "react-icons/hi";
import { Link } from "react-router-dom";

const Header = () => {
  const [toggle, setToggle] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="bg-gradient-to-r from-blue-400 to-purple-600 p-4 shadow-md relative">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <img
            src="/logo.jpg"
            alt="Logo"
            className="h-12 w-12 sm:h-16 sm:w-16 rounded-full"
          />
          <h1 className="text-white text-xl sm:text-2xl font-bold">GameHub</h1>
        </div>

        {/* Dark Mode Toggle */}
        <div className="flex items-center space-x-4">
          {toggle ? (
            <IoMoonOutline
              className="text-yellow-400 w-8 h-8 cursor-pointer"
              onClick={() => setToggle(!toggle)}
            />
          ) : (
            <HiSun
              className="text-yellow-400 w-8 h-8 cursor-pointer"
              onClick={() => setToggle(!toggle)}
            />
          )}

          {/* Search Icon for Mobile */}
          <div className="md:hidden">
            <CiSearch
              className="text-yellow-400 w-8 h-8 cursor-pointer"
              onClick={() => setShowSearch(!showSearch)}
            />
          </div>
        </div>
      </div>

      {/* Search Bar for Larger Screens */}
      <div className="hidden md:flex items-center bg-white rounded-full px-4 py-2 mt-4 shadow-md max-w-xs mx-auto">
        <CiSearch className="text-gray-500 w-6 h-6" />
        <input
          type="text"
          placeholder="Search games..."
          className="bg-transparent outline-none ml-2 w-full"
        />
      </div>

      {/* Mobile Search Bar */}
      {showSearch && (
        <div className="md:hidden mt-4">
          <div className="bg-white p-4 shadow-md flex items-center">
            <CiSearch className="text-gray-500 w-6 h-6" />
            <input
              type="text"
              placeholder="Search games..."
              className="bg-transparent outline-none ml-2 w-full"
            />
            <button
              className="text-gray-500 w-6 h-6"
              onClick={() => setShowSearch(false)}
            >
              ✖
            </button>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex flex-wrap justify-center sm:justify-start space-x-4 mt-4">
        <Link
          to="/"
          className="text-white hover:text-gray-300 transition duration-300 ease-in-out py-2 px-4 text-lg font-semibold block"
        >
          Home
        </Link>
        <Link
          to="/gth"
          className="text-blue-300 hover:text-blue-500 transition duration-300 ease-in-out py-2 px-4 text-lg font-semibold block"
        >
          Guess the Hex
        </Link>
        <Link
          to="/flipcard"
          className="text-purple-300 hover:text-purple-500 transition duration-300 ease-in-out py-2 px-4 text-lg font-semibold block"
        >
          Flip Card Game
        </Link>
        <Link
          to="/snakegame"
          className="text-yellow-300 hover:text-yellow-500 transition duration-300 ease-in-out py-2 px-4 text-lg font-semibold block"
        >
          Snake Game
        </Link>
        <Link
          to="/emojiintruder"
          className="text-red-300 hover:text-red-500 transition duration-300 ease-in-out py-2 px-4 text-lg font-semibold block"
        >
          Emoji Intruder
        </Link>
        <Link
          to="/rckpapsc"
          className="text-green-300 hover:text-green-500 transition duration-300 ease-in-out py-2 px-4 text-lg font-semibold block"
        >
          RockPaperScissors
        </Link>
      </nav>
    </div>
  );
};

export default Header;
