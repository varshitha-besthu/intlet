#  Intlet — AI-Powered Plan Executor for VS Code

**Intlet** is a VS Code extension inspired by _Traycer_, designed to help developers generate, visualize, and execute multi-phase coding plans using **Google Gemini**.

It takes a natural language query (like _"Add a dark mode toggle and commit changes"_) and breaks it into structured, executable phases — shell commands, git commits, file edits, and more.

---

##  Features

-  **Natural language → Actionable Plan**
-  **Phase-based execution**
-  **Dry-run mode & validation**
-  **Gemini-powered plan generation**
-  **Lightweight React UI**
-  **Secure environment variable handling**
-  **Type-safe schemas with Zod**

---

## 🛠️ Installation

###  Clone the Repository

```bash
git clone https://github.com/your-username/intlet.git
cd intlet
```

### Install Dependencies

Make sure you have **Node.js ≥ 18** and **VS Code** installed.

```bash
npm install
# or
yarn install
```

### Set up your Environment

Create a `.env` file at the project root:

```bash
GEMINI_API_KEY=your_api_key_here
```

You can get a free Gemini API key from:  
[https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

###  Build the Webview UI

Inside the `webview-ui/` folder:

```bash
cd webview-ui
npm install
npm run build
```

This generates your React UI inside `webview-ui/dist`.

### Run the Extension

Back in the root folder:

```bash
npm run compile
# or
npm run watch
```

Then open the project in VS Code:

```bash
code .
```

Press **F5** to launch a new **Extension Development Host** window.

---

##  Commands

| Command | Description |
|----------|--------------|
| `npm install` | Install dependencies |
| `npm run build` | Build both backend and frontend |
| `npm run compile` | Compile the VS Code extension |
| `npm run watch` | Watch for changes and rebuild automatically |
| `cd webview-ui && npm run dev` | Run React UI in dev mode (for debugging) |

---

## Tech Stack

- **VS Code Extension API**
- **React + TailwindCSS** for webview UI
- **Zod** for schema validation
- **@google/generative-ai (Gemini 2.5 Flash)**
- **TypeScript** everywhere

---

## Next Steps

- [ ] Add phase execution logs  
- [ ] Implement dry-run and revert logic  
- [ ] Introduce streaming updates  
- [ ] Backup via Git branches  

