/** @format */

import React from "react";
import Header from "./Header";
import styles from "./AboutPage.module.css";

function AboutPage() {
  return (
    <>
      <Header />

      <div className="min-h-screen flex flex-col items-center text-gray-100 py-16 px-4">
        <div className="max-w-6xl bg-opacity-50 bg-gray-800 backdrop-filter backdrop-blur-lg rounded-lg shadow-2xl p-8 space-y-8 transition duration-500 ease-in-out transform hover:scale-105 hover:shadow-2xl hover:bg-indigo-700">
          <h2 className="text-7xl font-extrabold text-center text-indigo-400 mb-6">
            About TeleGames
          </h2>

          <p className="text-1.5xl leading-relaxed tracking-wide text-gray-300 mb-4">
            Welcome to{" "}
            <span className="font-bold text-indigo-400">TeleGames</span>! We are
            dedicated to bringing you a fun and interactive gaming experience
            right at your fingertips. Our platform allows you to enjoy a wide
            selection of games that can be played instantly on our website or
            even through Telegram, making it easy to play wherever you are.
          </p>

          <p className="text-1.5xl  leading-relaxed tracking-wide text-gray-300">
            With our user-friendly setup, connecting your crypto wallet is
            simple, allowing you to manage your digital assets seamlessly.
            Currently, we feature five exciting games, with more on the way,
            ensuring there’s always something new to explore and enjoy. Whether
            you're looking to unwind with a quick game or dive into an exciting
            challenge, the Instant Games Platform is here to provide endless
            entertainment. Join us today and start your gaming adventure!
          </p>
        </div>
      </div>
    </>
  );
}

export default AboutPage;
