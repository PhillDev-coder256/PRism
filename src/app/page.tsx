// app/page.js (or .tsx) - V3 with Showcase Examples

'use client';

import React, { SetStateAction, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './page.module.css';
import FeedbackButton from './FeedbackButton'; // Assuming you have a FeedbackButton component

// Curated list of great examples to show off the tool
const examplePRs = [
  {
    name: 'Laravel Framework (PHP)',
    description: 'A deep analysis of a modified file, detecting dozens of internal implementation changes.',
    url: 'https://github.com/laravel/framework/pull/46884',
    lang: 'PHP'
  },
  {
    name: 'Sentry SDK (TypeScript)',
    description: 'See how the tool analyzes newly added features and files in a major TypeScript library.',
    url: 'https://github.com/getsentry/sentry-javascript/pull/5800',
    lang: 'JS'
  },
  {
    name: 'Next.js by Vercel (JavaScript)',
    description: 'This PR removes old code. Context Keeper correctly identifies the removed functions.',
    url: 'https://github.com/vercel/next.js/pull/46211',
    lang: 'JS'
  }
];


export default function Home() {
  const [prUrl, setPrUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // The main analysis function, now reusable
  const handleAnalysis = async (url: string) => {
    if (!url) return;
    setIsLoading(true);
    setResult(null);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Network response was not ok');
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred.';
      setError(`Failed to analyze PR: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handles form submission
  const handleSubmit = async (event: { preventDefault: () => void; }) => { // for TSX use: React.FormEvent
    event.preventDefault();
    handleAnalysis(prUrl);
  };
  
  // Handles clicking on an example card
  const handleExampleClick = (url: SetStateAction<string>) => {
    setPrUrl(url);
    handleAnalysis(url);
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Context Keeper</h1>
      <p className={styles.description}>
        <ReactMarkdown>Go beyond the `diff`. Understand the *story* behind code changes.</ReactMarkdown>
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="url"
          value={prUrl}
          onChange={(e) => setPrUrl(e.target.value)}
          placeholder="https://github.com/owner/repo/pull/123"
          required
          className={styles.input}
        />
        <button type="submit" disabled={isLoading && !result} className={styles.button}>
          {isLoading ? <span className={styles.loadingText}>Analyzing...</span> : 'Analyze PR'}
        </button>
      </form>

      {/* --- New Showcase Section --- */}
      {!result && !isLoading && (
        <div className={styles.exampleContainer}>
            <h2 className={styles.exampleTitle}>Or, try one of these...</h2>
            <div className={styles.exampleGrid}>
                {examplePRs.map((pr) => (
                    <div key={pr.name} className={styles.exampleCard} onClick={() => handleExampleClick(pr.url)}>
                        <div className={`${styles.langBadge} ${pr.lang === 'PHP' ? styles.php : styles.js}`}>
                          {pr.lang}
                        </div>
                        <h3>{pr.name}</h3>
                        <p>{pr.description}</p>
                        <span className={styles.tryMe}>Analyze ✨</span>
                    </div>
                ))}
            </div>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {result && (
        <div className={styles.result}>
          <h2>Analysis Complete</h2>
          <h3>🔗 Pull Request URL</h3>
          <p>
            <a style={{ color: 'blue', textDecoration: 'underline' }} href={prUrl} target="_blank" rel="noopener noreferrer">
              {prUrl}
            </a>
          </p>

          <h3>📖 Pull Request Storyline</h3>
          <div className={styles.storyline}>
            <ReactMarkdown>{result.storyline}</ReactMarkdown>
          </div>

          <h3>📝 Documentation Prompts</h3>

          { result.prompts.length > 0 ? (
            <ul className={styles.prompts}>
              {result.prompts.map((prompt, index) => (
                <li key={index} className={styles.promptItem}>
                  <ReactMarkdown>{prompt}</ReactMarkdown>
                </li>
              ))}
            </ul>
          ) : (
            <p>No documentation prompts found.</p>
          )}

          <h3>Raw Diff</h3>
          <pre className={styles.diff}>
            <code>{result.raw_diff}</code>
          </pre>
        </div>
      )}
      <FeedbackButton />
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.footerText}>
            Made with <span className={styles.heart}>❤️</span> by{' '}
            <a
              href="https://github.com/PhillDev-coder256"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              philldevcoder
            </a>
          </p>
        </div>
      </footer>

    </main>
  );
}