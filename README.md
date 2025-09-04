Got it ✅ — here’s a clean **README.md** for your project:

---

# 🦍 Website Cloner CLI (GenAI + OpenAI + Puppeteer)

A command-line tool that uses **OpenAI GPT**, **Puppeteer**, and **Node.js** to scrape and clone websites into fully working HTML/CSS/JS projects.
The assistant follows a **step-by-step reasoning loop** (START → THINK → TOOL → OBSERVE → OUTPUT) to analyze, scrape, and generate a website clone.

---

## 🚀 Features

* Scrapes target websites with **Puppeteer**
* Generates **static clones** using HTML, CSS, and JavaScript
* Writes project files automatically (`index.html`, `styles.css`, `script.js`)
* Uses **OpenAI GPT** to plan and structure the clone
* Modular **TOOL system** (`scrape_website`, `CODE`)
* Strict **JSON-driven workflow** for reproducibility

---

## 📂 Project Structure

When cloning a site, the tool creates a new folder:

```
project_name/
 ├── index.html
 ├── styles.css
 └── script.js
```

---

## ⚙️ Installation

### 1. Clone the repo

```bash
git clone https://github.com/your-username/website-cloner-cli.git
cd website-cloner-cli
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment

Create a `.env` file in the root:

```
OPENAI_API_KEY=your_openai_api_key
```

---

## ▶️ Usage

Run the CLI with a target URL:

```bash
node index.js https://www.netflix.com/browse
```

Example output:

```
🔥 User wants to clone Netflix browse page: https://www.netflix.com/browse
🛠️: scrape_website(...) = content retrieved
🧠 Plan: create project folder and HTML/CSS/JS files
🛠️: CODE(mkdir project) = ✅ folder created
🛠️: CODE(filepath:index.html) = ✅ file written
🤖 Clone ready at ./project
```

Open the generated `index.html` in your browser 🎉

---

## 🛠️ Available Tools

* **scrape\_website(url: string)** → extracts content and layout from a website
* **CODE(input: string)** → executes shell commands (e.g., `mkdir`, `ni`)
* **CODE(filepath: string, data: string)** → writes content directly to a file

---

## 📜 Workflow

The AI assistant strictly follows this loop:

1. **START** → Acknowledge user request
2. **THINK** → Plan steps
3. **TOOL** → Call available tools (`scrape_website`, `CODE`)
4. **OBSERVE** → Developer logs result of tool execution
5. **OUTPUT** → Confirm project clone is ready

---

## 🔑 Example JSON Flow

```json
{"step":"START","content":"User wants to clone https://www.google.com"}
{"step":"THINK","content":"I should scrape the website to analyze its layout"}
{"step":"TOOL","tool_name":"scrape_website","input":"https://www.google.com"}
{"step":"THINK","content":"Now I will create a new project folder"}
{"step":"TOOL","tool_name":"CODE","input":"mkdir google_clone"}
{"step":"TOOL","tool_name":"CODE","filepath":"google_clone/index.html","data":"<html>...</html>"}
{"step":"OUTPUT","content":"Clone created in ./google_clone"}
```

---

## 📌 Requirements

* Node.js 18+
* OpenAI API key
* Internet connection for scraping

---

