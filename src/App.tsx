
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { openSearchPanel } from "@codemirror/search";

import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";

import {
  FilePlus,
  FolderOpen,
  Save,
  Moon,
  Sun,
  X,
  Search,
  FileText,
  Replace,
  Code2,
  Info
} from "lucide-react";

import "./App.css";

// --------------------------------------------------
// Types
// --------------------------------------------------

interface DocumentTab {
  id: string;
  name: string;
  path: string | null;
  content: string;
  savedContent: string;
}

type Theme = "light" | "dark";

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function createDocument(): DocumentTab {
  return {
    id: crypto.randomUUID(),
    name: "Untitled",
    path: null,
    content: "",
    savedContent: ""
  };
}

function getLanguage(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "js":
    case "jsx":
      return javascript({ jsx: true });

    case "ts":
    case "tsx":
      return javascript({
        jsx: true,
        typescript: true
      });

    case "json":
      return json();

    case "html":
    case "htm":
      return html();

    case "css":
      return css();

    case "md":
    case "markdown":
      return markdown();

    default:
      return [];
  }
}

function getStats(content: string) {
  const words = content.trim()
    ? content.trim().split(/\s+/).length
    : 0;

  return {
    words,
    characters: content.length,
    lines: content.split("\n").length
  };
}

// --------------------------------------------------
// Main Application
// --------------------------------------------------

function App() {
  const [tabs, setTabs] = useState<DocumentTab[]>([
    createDocument()
  ]);

  const [activeId, setActiveId] = useState("");

  const [theme, setTheme] = useState<Theme>("light");

  const [message, setMessage] = useState("Ready");

  const editorViewRef = useRef<EditorView | null>(null);

  const activeTab = useMemo(
    () => tabs.find(tab => tab.id === activeId) ?? tabs[0],
    [tabs, activeId]
  );

  // --------------------------------------------------
  // Initial active tab
  // --------------------------------------------------

  useEffect(() => {
    if (!activeId && tabs.length > 0) {
      setActiveId(tabs[0].id);
    }
  }, [activeId, tabs]);

  // --------------------------------------------------
  // Update document
  // --------------------------------------------------

  const updateTab = useCallback(
    (id: string, changes: Partial<DocumentTab>) => {
      setTabs(previous =>
        previous.map(tab =>
          tab.id === id
            ? { ...tab, ...changes }
            : tab
        )
      );
    },
    []
  );

  // --------------------------------------------------
  // New document
  // --------------------------------------------------

  const newFile = useCallback(() => {
    const document = createDocument();

    setTabs(previous => [...previous, document]);

    setActiveId(document.id);

    setMessage("New document created");
  }, []);

  // --------------------------------------------------
  // Open document
  // --------------------------------------------------

  const openFile = useCallback(async () => {
    try {
      const file = await window.desktop.openFile();

      if (!file) return;

      const existing = tabs.find(
        tab => tab.path === file.path
      );

      if (existing) {
        setActiveId(existing.id);
        return;
      }

      const document: DocumentTab = {
        id: crypto.randomUUID(),
        name: file.name,
        path: file.path,
        content: file.content,
        savedContent: file.content
      };

      setTabs(previous => [...previous, document]);

      setActiveId(document.id);

      setMessage(`Opened ${file.name}`);

    } catch (error) {
      console.error(error);

      setMessage("Unable to open file");

      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to open file."
      );
    }
  }, [tabs]);

  // --------------------------------------------------
  // Save document
  // --------------------------------------------------

  const saveFile = useCallback(
    async (saveAs = false) => {
      if (!activeTab) return;

      try {
        const result = await window.desktop.saveFile(
          activeTab.path,
          activeTab.content,
          saveAs
        );

        if (!result) return;

        updateTab(activeTab.id, {
          path: result.path,
          name: result.name,
          savedContent: activeTab.content
        });

        setMessage(`Saved ${result.name}`);

      } catch (error) {
        console.error(error);

        setMessage("Save failed");

        window.alert(
          error instanceof Error
            ? error.message
            : "Unable to save file."
        );
      }
    },
    [activeTab, updateTab]
  );

  // --------------------------------------------------
  // Close document
  // --------------------------------------------------

  const closeTab = useCallback(
    (id: string) => {
      const document = tabs.find(tab => tab.id === id);

      if (!document) return;

      const isDirty =
        document.content !== document.savedContent;

      if (isDirty) {
        const discard = window.confirm(
          `${document.name} has unsaved changes.\n\nClose without saving?`
        );

        if (!discard) return;
      }

      const remaining = tabs.filter(
        tab => tab.id !== id
      );

      if (remaining.length === 0) {
        const newDocument = createDocument();

        setTabs([newDocument]);

        setActiveId(newDocument.id);

        return;
      }

      setTabs(remaining);

      if (activeId === id) {
        const oldIndex = tabs.findIndex(tab => tab.id === id);

        const nextIndex = Math.min(
          oldIndex,
          remaining.length - 1
        );

        setActiveId(remaining[nextIndex].id);
      }
    },
    [tabs, activeId]
  );

  // --------------------------------------------------
  // Find / Replace
  // --------------------------------------------------

  const showFind = useCallback(() => {
    if (editorViewRef.current) {
      openSearchPanel(editorViewRef.current);
    }
  }, []);

  // --------------------------------------------------
  // Keyboard shortcuts
  // --------------------------------------------------

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;

      const key = event.key.toLowerCase();

      if (key === "n") {
        event.preventDefault();
        newFile();
      }

      if (key === "o") {
        event.preventDefault();
        void openFile();
      }

      if (key === "s") {
        event.preventDefault();
        void saveFile(event.shiftKey);
      }

      if (key === "w") {
        event.preventDefault();

        if (activeTab) {
          closeTab(activeTab.id);
        }
      }

      if (key === "f") {
        event.preventDefault();
        showFind();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyboard,
      true
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboard,
        true
      );
    };
  }, [
    newFile,
    openFile,
    saveFile,
    closeTab,
    activeTab,
    showFind
  ]);

  // --------------------------------------------------
  // Theme
  // --------------------------------------------------

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // --------------------------------------------------
  // Editor extensions
  // --------------------------------------------------

  const extensions = useMemo(
    () => [
      EditorView.lineWrapping,
      getLanguage(activeTab?.name ?? "")
    ],
    [activeTab?.name]
  );

  // --------------------------------------------------
  // Statistics
  // --------------------------------------------------

  const stats = getStats(activeTab?.content ?? "");

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className={`app ${theme}`}>

      {/* Header */}

      <header className="titlebar">

        <div className="brand">

          <div className="brand-icon">
            <FileText size={19} />
          </div>

          <span>Ypad</span>

          <span className="version">v1.0</span>

        </div>

        <div className="title-actions">

          <button
            className="icon-btn"
            title="Toggle Theme"
            onClick={() =>
              setTheme(previous =>
                previous === "light" ? "dark" : "light"
              )
            }
          >
            {theme === "light"
              ? <Moon size={18} />
              : <Sun size={18} />
            }
          </button>

          <button
            className="icon-btn"
            title="About"
            onClick={() =>
              window.alert(
                "Ypad\nVersion 1.0.0\n\nAdvanced Windows Text Editor"
              )
            }
          >
            <Info size={18} />
          </button>

        </div>

      </header>

      {/* Toolbar */}

      <nav className="toolbar">

        <button onClick={newFile}>
          <FilePlus size={16} />
          New
        </button>

        <button onClick={() => void openFile()}>
          <FolderOpen size={16} />
          Open
        </button>

        <button
          onClick={() => void saveFile(false)}
          disabled={!activeTab}
        >
          <Save size={16} />
          Save
        </button>

        <button
          onClick={() => void saveFile(true)}
          disabled={!activeTab}
        >
          <Save size={16} />
          Save As
        </button>

        <div className="toolbar-divider" />

        <button
          onClick={showFind}
          disabled={!activeTab}
        >
          <Search size={16} />
          Find
        </button>

        <button
          onClick={showFind}
          disabled={!activeTab}
        >
          <Replace size={16} />
          Replace
        </button>

      </nav>

      {/* Tabs */}

      <div className="tabs">

        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`tab ${
              activeId === tab.id ? "active" : ""
            }`}
            onClick={() => setActiveId(tab.id)}
          >

            <Code2 size={15} />

            <span className="tab-name">
              {tab.name}
            </span>

            {tab.content !== tab.savedContent && (
              <span className="dirty-dot" />
            )}

            <button
              className="tab-close"
              title="Close Tab"
              onClick={event => {
                event.stopPropagation();
                closeTab(tab.id);
              }}
            >
              <X size={14} />
            </button>

          </div>
        ))}

        <button
          className="new-tab"
          title="New Tab"
          onClick={newFile}
        >
          +
        </button>

      </div>

      {/* Editor */}

      <main className="editor-container">

        {activeTab && (
          <CodeMirror
            key={activeTab.id}
            value={activeTab.content}
            height="100%"
            theme={
              theme === "dark"
                ? oneDark
                : "light"
            }
            extensions={extensions}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLine: true,
              highlightActiveLineGutter: true,
              foldGutter: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              searchKeymap: true,
              highlightSelectionMatches: true
            }}
            onCreateEditor={view => {
              editorViewRef.current = view;
            }}
            onChange={value => {
              updateTab(activeTab.id, {
                content: value
              });
            }}
          />
        )}

      </main>

      {/* Status Bar */}

      <footer className="statusbar">

        <div className="status-left">
          <span>{message}</span>

          <span>
            {activeTab?.path ?? "Unsaved document"}
          </span>
        </div>

        <div className="status-right">

          <span>{stats.lines} Lines</span>

          <span>{stats.words} Words</span>

          <span>{stats.characters} Characters</span>

          <span>UTF-8</span>

          <span>{theme.toUpperCase()}</span>

        </div>

      </footer>

    </div>
  );
}

export default App;
