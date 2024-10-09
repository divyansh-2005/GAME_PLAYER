import React from 'react';
import Header from './Header';
import styles from './ContactPage.module.css'; // Import the CSS module for styling

function ContactPage() {
  return (
    <>
      <Header />
      <div className={styles.body}>
        <div className={styles.container}>
          <h2 className={styles.title}>Contact Us</h2>
          <p className={styles.pTitle}>We'd love to hear from you!</p>
          <p className={styles.pPara}>
            If you have any questions, feedback, or inquiries about our platform, feel free to reach out to us. Our team is here to assist you and ensure you have the best gaming experience possible.
          </p>
          
          <h2 className={styles.subTitle}>Contact Information</h2>
          <p className={styles.pPara}>
            <strong>Email:</strong> support@telegames.com
          </p>
          <p className={styles.pPara}>
            <strong>Phone:</strong> +1 (234) 567-8901
          </p>
          <p className={styles.pPara}>
            <strong>Follow us on social media:</strong>
            <br />
            <a href="" target="_blank" rel="noopener noreferrer">Twitter</a> | 
            <a href="" target="_blank" rel="noopener noreferrer">Facebook</a> | 
            <a href="" target="_blank" rel="noopener noreferrer">Instagram</a>
          </p>
          
        </div>
      </div>
    </>
  );
}

export default ContactPage;
