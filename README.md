# Ypad – Modern Desktop Text Editor

**Ypad** is a lightweight, modern desktop text editor designed to provide a clean, simple, and efficient writing and editing experience on Windows.

Built using **React, TypeScript, Vite, Electron, and CodeMirror**, Ypad combines the flexibility of modern web technologies with the convenience of a native desktop application.

## ✨ Features

- **Modern User Interface:** Clean and minimal interface designed for productivity.
- **Multiple Documents:** Work with multiple documents using tabs.
- **File Management:** Create, open, edit, save, and save documents with Save As.
- **Syntax Highlighting:** CodeMirror-powered editing with support for common programming and markup languages.
- **Find & Replace:** Search for text and replace matching content.
- **Light & Dark Themes:** Switch between light and dark editor themes.
- **Keyboard Shortcuts:** Convenient shortcuts for common editing operations.
- **Document Statistics:** View line count, word count, and character count.
- **Encoding Information:** Displays document encoding, including UTF-8.
- **Windows Installer:** Package the application as a Windows installer using Electron Builder.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type-safe development |
| Vite | Development server and frontend build |
| Electron | Desktop application framework |
| CodeMirror | Text editor engine |
| Electron Builder | Windows application packaging |
| CSS | Application styling |

## 📸 Application Preview

Ypad provides a clean desktop interface with a document toolbar, tab-based editing, a spacious editor, and a document status bar.

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Git](https://git-scm.com/)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/Ypad.git
```

### 2. Navigate to the project

```bash
cd Ypad
```

### 3. Install dependencies

```bash
npm install
```

### 4. Run in development mode

```bash
npm run dev
```

## 📦 Build for Windows

To generate the Windows installer, execute:

```bash
npm run build:win
```

The installer will be generated inside the `release` directory.

Expected installer filename:

```text
Yatharv-Notepad-Setup-1.0.0.exe
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl + N | New document |
| Ctrl + O | Open document |
| Ctrl + S | Save document |
| Ctrl + Shift + S | Save As |
| Ctrl + F | Find |
| Ctrl + W | Close document |

*Shortcut availability may depend on the current application implementation.*

## 📁 Project Structure

```text
Ypad/
│
├── electron/
│   ├── main.ts
│   └── preload.ts
│
├── src/
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── public/
│
├── dist/
├── dist-electron/
├── release/
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

*Generated build directories may vary depending on the build configuration.*

## 🔒 Security

Ypad uses Electron's process separation architecture. The application is designed to keep Node.js access out of the renderer process and use a preload bridge for desktop functionality.

## 🗺️ Roadmap

Potential improvements planned for future releases:

- [ ] Custom Ypad application icon and branding
- [ ] Automatic document saving
- [ ] Unsaved document recovery
- [ ] Recent documents history
- [ ] Advanced editor preferences
- [ ] Customizable font size and editor settings
- [ ] Improved find and replace functionality
- [ ] Automatic application updates

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

1. Fork this repository.
2. Create a feature branch.
3. Commit your changes.
4. Push your branch.
5. Open a Pull Request.

## 📄 License

This project is currently under development. Licensing information will be added before public distribution.

---

**Ypad – Write. Edit. Create.**

A simple editor for everyday writing and development.