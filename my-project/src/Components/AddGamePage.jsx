import React, { useState } from 'react';
import axios from 'axios';
// import styles from './AddGamePage.module.css'; 
import Header from './Header';
import video from '../assets/background-video.mp4';
import { ConnectButton } from "@rainbow-me/rainbowkit";

const AddGamePage = () => {
  const [gameName, setGameName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/games/add', {
        name: gameName,
        description,
        url
      });
      setMessage(response.data.message);
      // Reset form
      setGameName('');
      setDescription('');
      setUrl('');
    } catch (error) {
      setMessage('Error adding game. Please try again.');
      console.error('Error adding game:', error);
    }
  };

  return (
    <>
      <Header />
      {/* <body className={styles.body}>
        <video id={styles.bgv} src={video} autoPlay muted loop></video>
        <div className={styles.container}>
          <div className={styles.Logo}>
            <h1 id={styles.head}>ADD GAME</h1>
          </div>
          <div className={styles.wrapper}>
            <h2>Welcome</h2>
            <form onSubmit={handleSubmit}>
              <div className={`${styles.formgroup} ${styles.Label}`}>
                <label htmlFor="gameName">Game Name</label>
                <input
                  type="text"
                  id="gameName"
                  name="gameName"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  required
                  maxLength="20"
                  className={styles.input}
                />
              </div>
              <div className={`${styles.formgroup} ${styles.Label}`}>
                <label htmlFor="description">Description</label>
                <input
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className={styles.textarea}
                ></input>
              </div>
              <div className={`${styles.formgroup} ${styles.Label}`}>
                <label htmlFor="url">Game URL</label>
                <input
                  type="text"
                  id="url"
                  name="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  pattern="^(https?|ftp)://[^\s/$.?#].[^\s]*$"
                  title="Enter a valid URL starting with http://, https://, or ftp://"
                  className={styles.input}
                />
              </div>
              <div className={styles.Signin}>
                <input type="submit" value="Submit" className={styles.submitButton} />
                
                <ConnectButton />
              </div>
            </form>
            {message && <p className={styles.message}>{message}</p>}
          </div>
        </div>
      </body> */}
    </>
  );
};

export default AddGamePage;
