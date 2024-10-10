import React from "react";
import Header from "./Header";
import styles from './AboutPage.module.css'; // Import the CSS module

function AboutPage() {
  return (
    <>
      <Header />

      <div className={styles.body}>

        <div className={styles.container} id="about">

          <h2 className={styles.title}>About TeleGames</h2>

          <br />

          <p className="p-para">
            Welcome to TeleGames! We are dedicated to bringing
            you a fun and interactive gaming experience right at your fingertips.
            Our platform allows you to enjoy a wide selection of games that can be
            played instantly on our website or even through Telegram, making it
            easy to play wherever you are.
          </p>

          <br />

          <p className="p-para">
            With our user-friendly setup, connecting your crypto wallet is a
            breeze, allowing you to manage your digital assets seamlessly.
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
