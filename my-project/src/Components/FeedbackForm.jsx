import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import styles from './FeedbackForm.module.css';

const FeedbackForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the feedback to your backend
    console.log('Feedback submitted:', { name, email, feedback });
    // Reset form fields
    setName('');
    setEmail('');
    setFeedback('');
    // Show thank you message
    alert('Thank you for your feedback!');
    // Redirect to home page
    navigate('/');
  };

  return (
    <>
      <Header />
      <div className={styles.body}>
        <div className={styles.container}>
          <h2 className={styles.title}>Feedback Form</h2>
          <form onSubmit={handleSubmit} className={styles.feedbackForm}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>Name:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="feedback" className={styles.label}>Feedback:</label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
                className={styles.textarea}
              ></textarea>
            </div>
            <button type="submit" className={styles.submitButton}>Submit Feedback</button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FeedbackForm;
