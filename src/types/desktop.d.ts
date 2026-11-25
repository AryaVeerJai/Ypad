
export interface OpenedFile {
  path: string;
  name: string;
  content: string;
}

export interface SavedFile {
  path: string;
  name: string;
}

export interface DesktopAPI {
  openFile: () => Promise<OpenedFile | null>;

  saveFile: (
    filePath: string | null,
    content: string,
    saveAs: boolean
  ) => Promise<SavedFile | null>;
}

declare global {
  interface Window {
    desktop: DesktopAPI;
  }
}

export {};
