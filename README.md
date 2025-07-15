# 🚀 g!tPRism

[![Visit g!tPRism](https://img.shields.io/badge/Visit_Live_App-✨-brightgreen?style=for-the-badge&logo=netlify)](https://gitprism.netlify.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Built with: Next.js](https://img.shields.io/badge/Built_with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Powered by: PHP](https://img.shields.io/badge/Powered_by-PHP-777BB4?style=for-the-badge&logo=php)](https://www.php.net/)

**Go beyond the `diff`. Understand the *story* behind code changes.**

g!tPRism is an intelligent code review assistant that transforms confusing pull requests into a human-readable story. Instead of a simple wall of red and green text, it provides a semantic analysis of what *actually* changed, saving developers time, reducing review fatigue, and preventing bugs.

---

### ✨ The "Wow" Moment: Live App Screenshot

![g!tPRism Screenshot](/src/app/demo.png) 

---

## 😫 The Problem: Code Review Amnesia

Every developer has felt this pain:
- **Confusing Pull Requests:** A simple `diff` shows you *what* lines changed, but it doesn't explain *why* or what the structural impact is.
- **Review Fatigue:** Trying to decipher a large PR drains mental energy, leading to superficial "looks good to me" approvals.
- **Lost Context:** Over time, the reason behind a specific code change gets lost, making future maintenance a painful "archaeological dig".

## 💡 The Solution: A Semantic Story

g!tPRism re-imagines the code review process by focusing on intent and impact. It connects to the GitHub API, fetches the pull request data, and runs a deep analysis to generate:

-   ✅ **A Human-Readable Storyline:** Clearly states what happened, such as "💡 **Implementation changed inside:** `Str::lower`" or "✅ **New function/method added:** `createUser`".
-   ✅ **Actionable Documentation Prompts:** Automatically identifies new functions and reminds you to document them.
-   ✅ **A Clean, Distraction-Free UI:** A beautiful "Neon Noir" interface designed to be easy on the eyes and a pleasure to use.

---

## 🚀 Key Features

-   **Analyze Any Public Pull Request:** Just paste a GitHub PR URL to get started.
-   **Multi-Language Engine:**
    -   **Deep PHP Analysis:** Uses Abstract Syntax Tree (AST) parsing to detect changes inside function bodies, not just their signatures.
    -   **High-Level JS/TS Analysis:** Uses smart pattern matching to detect new and removed functions in JavaScript and TypeScript files.
-   **Click-to-Try Examples:** A showcase of hand-picked PRs to demonstrate the tool's power instantly.
-   **Floating Feedback Form:** A beautiful, non-intrusive way to share your ideas for what to build next.
-   **Fully Responsive Design:** Works beautifully on desktop and mobile.

---

## 🛠️ Tech Stack

This project is a hybrid application, demonstrating a modern approach to combining a JavaScript frontend with a powerful backend script.

-   **Frontend:**
    -   [**Next.js**](https://nextjs.org/) / [**React**](https://reactjs.org/)
    -   [**React Markdown**](https://github.com/remarkjs/react-markdown) for rich text rendering.
    -   **CSS Modules** for scoped, component-based styling.
    -   Hosted on [**Netlify**](https://www.netlify.com/).

-   **Backend API:**
    -   [**PHP**](https://www.php.net/) (Served as a serverless-style API on a custom server).
    -   [**PHP-Parser**](https://github.com/nikic/PHP-Parser) for deep AST analysis of PHP code.
    -   [**Composer**](https://getcomposer.org/) for backend dependency management.

---

## 🔧 Getting Started & Local Development

Want to run g!tPRism on your own machine? Here's how:

**Prerequisites:**
-   [Node.js](https://nodejs.org/en/) (v16.x or later)
-   [PHP](https://www.php.net/downloads) (v8.x or later)
-   [Composer](https://getcomposer.org/download/)

**Installation & Setup:**

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/philldev-coder256/PRism.git 
    cd PRism
    ```

2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```

3.  **Install backend dependencies:**
    ```bash
    # Make sure you are in the project's root folder
    # Composer will work on the files in your /api directory
    composer install
    ```

4.  **Run the development servers:**
    *   In one terminal, start the Next.js frontend:
        ```bash
        npm run dev
        ```
        *(Your app will be available at `http://localhost:3000`)*

    *   In a **second** terminal, navigate to the `api` folder and start the PHP server:
        ```bash
        cd api
        php -S localhost:8000
        ```

5.  **Open the app!** You can now access the full application at `http://localhost:3000`.

---

## 🤝 How to Contribute

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/philldev-coder256/PRism/issues) for open tasks or submit a new one.

---

## 📜 License

This project is open-source and distributed under the **MIT License**. See `LICENSE` for more information.

---

Made with ❤️ by [**PhillDevCoder**](https://github.com/philldev-coder256).

```