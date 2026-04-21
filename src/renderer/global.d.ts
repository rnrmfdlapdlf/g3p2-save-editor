import type { SaveEditorApi } from "../preload/preload";

declare global {
  interface Window {
    g3p2SaveEditor: SaveEditorApi;
  }
}

export {};
