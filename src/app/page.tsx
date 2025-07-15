'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './page.module.css';
import FeedbackButton from './FeedbackButton'; // Make sure this exists and works

// --- Types ---
interface PRResult {
  storyline: string;
  prompts: string[];
  raw_diff: string;
}

// --- Example PRs ---
const examplePRs = [
  {
    name: 'Laravel Framework (PHP)',
    description:
      'A deep analysis of a modified file, detecting dozens of internal implementation changes.',
    url: 'https://github.com/laravel/framework/pull/46884',
    lang: 'PHP',
  },
  {
    name: 'Sentry SDK (TypeScript)',
    description:
      'See how the tool analyzes newly added features and files in a major TypeScript library.',
    url: 'https://github.com/getsentry/sentry-javascript/pull/5800',
    lang: 'JS',
  },
  {
    name: 'Next.js by Vercel (JavaScript)',
    description:
      'This PR removes old code. g!tPRism correctly identifies the removed functions.',
    url: 'https://github.com/vercel/next.js/pull/46211',
    lang: 'JS',
  },
];

// --- Main Component ---
export default function Home() {
  const [prUrl, setPrUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PRResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleAnalysis = async (url: string) => {
    if (!url) return;
    setIsLoading(true);
    setResult(null);
    setError('');

    const apiUrl = process.env.NEXT_PUBLIC_ANALYSIS_API;

if (!apiUrl) {
  setError('API URL is not configured.');
  setIsLoading(false);
  return;
}

try {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    let errMsg = 'Network response was not ok';
    try {
      const errData = await response.json();
      errMsg = errData.error || errMsg;
    } catch {
      // fallback
    }
    throw new Error(errMsg);
  }

  const data: PRResult = await response.json();

  if (
    typeof data.storyline !== 'string' ||
    !Array.isArray(data.prompts) ||
    typeof data.raw_diff !== 'string'
  ) {
    throw new Error('Invalid data structure from API');
  }

  setResult(data);
} catch (err) {
  const message = err instanceof Error ? err.message : 'An unknown error occurred.';
  setError(`Failed to analyze PR: ${message}`);
} finally {
  setIsLoading(false);
}

  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleAnalysis(prUrl.trim());
  };

  const handleExampleClick = (url: string) => {
    setPrUrl(url);
    handleAnalysis(url);
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>g!tPRism</h1>
      <p className={styles.description}>
        <ReactMarkdown>
          Go beyond the `diff`. Understand the *story* behind code changes.
        </ReactMarkdown>
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="url"
          value={prUrl}
          onChange={(e) => setPrUrl(e.target.value)}
          placeholder="https://github.com/owner/repo/pull/123"
          required
          className={styles.input}
          disabled={isLoading}
        />
        
        <button type="submit" disabled={isLoading || !prUrl.trim()} className={styles.button}>
          {isLoading ? <span className={styles.loadingText}>Analyzing...</span> : 'Analyze PR'}
        </button>
      </form>

      {!result && !isLoading && (
        <section className={styles.exampleContainer}>
          <h2 className={styles.exampleTitle}>Or, try one of these...</h2>
          <div className={styles.exampleGrid}>
            {examplePRs.map((pr) => (
              <div
                key={pr.name}
                className={styles.exampleCard}
                onClick={() => handleExampleClick(pr.url)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleExampleClick(pr.url);
                }}
              >
                <div
                  className={`${styles.langBadge} ${
                    pr.lang === 'PHP' ? styles.php : styles.js
                  }`}
                >
                  {pr.lang}
                </div>
                <h3>{pr.name}</h3>
                <p>{pr.description}</p>
                <span className={styles.tryMe}>Analyze ✨</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {result && (
        <section className={styles.result}>
          <h2>Analysis Complete</h2>

          <h3>🔗 Pull Request URL</h3>
          <p>
            <a
              href={prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              {prUrl}
            </a>
          </p>

          <h3>📖 Pull Request Storyline</h3>
          <div className={styles.storyline}>
            <ReactMarkdown>{result.storyline}</ReactMarkdown>
          </div>

          <h3>📝 Documentation Prompts</h3>
          {result.prompts.length > 0 ? (
            <ul className={styles.prompts}>
              {result.prompts.map((prompt, i) => (
                <li key={i} className={styles.promptItem}>
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
        </section>
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
