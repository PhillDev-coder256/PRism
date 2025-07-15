// app/FeedbackButton.js
'use client';

import { useState } from 'react';
import styles from './FeedbackButton.module.css';
import { FeedbackIcon, CloseIcon, CheckIcon } from './icons'; // Adjust path if needed

export default function FeedbackButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('feature');
  const [feedbackText, setFeedbackText] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('sending');
    try {
      const response = await fetch('http://localhost:8000/send-feedback.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackType, feedbackText }),
      });

      if (!response.ok) {
        throw new Error('Server responded with an error.');
      }
      
      const res = await response.json();
      if (!res.success) {
        throw new Error(res.error || 'The server could not send the email.');
      }
      
      setStatus('success');
      setFeedbackText('');
      setFeedbackType('feature');

      setTimeout(() => {
        setIsModalOpen(false);
        setTimeout(() => setStatus('idle'), 400); // Reset status after modal closes
      }, 2000); // Close modal after 2 seconds

    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <>
      <button className={styles.floatingButton} onClick={() => setIsModalOpen(true)} aria-label="Send Feedback">
        <FeedbackIcon />
      </button>

      <div className={`${styles.overlay} ${isModalOpen ? styles.open : ''}`} onClick={() => setIsModalOpen(false)}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          
          {(status === 'sending' || status === 'success') && (
            <div className={styles.stateOverlay}>
              {status === 'sending' && <div className={styles.spinner}></div>}
              {status === 'success' && <div className={styles.successIcon}><CheckIcon /></div>}
              <h3>{status === 'sending' ? 'Sending...' : 'Thank You!'}</h3>
              <p>{status === 'success' && 'Your feedback has been sent.'}</p>
            </div>
          )}

          <button className={styles.closeButton} onClick={() => setIsModalOpen(false)} aria-label="Close feedback form">
            <CloseIcon />
          </button>
          <h2>Share Your Thoughts</h2>
          <p>What should we work on next? Let us know!</p>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.feedbackTypes}>
              <label>
                <input type="radio" name="feedbackType" value="feature" checked={feedbackType === 'feature'} onChange={(e) => setFeedbackType(e.target.value)} />
                <span>✨ New Feature</span>
              </label>
              <label>
                <input type="radio" name="feedbackType" value="bug" checked={feedbackType === 'bug'} onChange={(e) => setFeedbackType(e.target.value)} />
                <span>🐞 Report Bug</span>
              </label>
              <label>
                <input type="radio" name="feedbackType" value="other" checked={feedbackType === 'other'} onChange={(e) => setFeedbackType(e.target.value)} />
                <span>💬 Other</span>
              </label>
            </div>
            <textarea
              className={styles.textarea}
              placeholder="I would love to see..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              required
            />
             {status === 'error' && <p className={styles.errorMessage}>Oops! Something went wrong. Please try again.</p>}
            <button type="submit" className={styles.submitButton} disabled={!feedbackText || status === 'sending'}>
              Send Feedback
            </button>
          </form>
        </div>
      </div>
    </>
  );
}