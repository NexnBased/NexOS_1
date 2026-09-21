import { useRef, useState, useEffect } from "react";
import { SaveIcon, FileTextIcon, CircleAlertIcon } from "lucide-react";
import { useFileSystemStore } from "../../stores/FileSystemStore";

interface Props {
  width: number;
  height: number;
  fileId?: string;
}

function TextEditor({ fileId }: Props) {
  const file = useFileSystemStore((state) => fileId ? state.getItem(fileId) : undefined);
  const updateFileContent = useFileSystemStore((state) => state.updateFileContent);

  const [draft, setDraft] = useState(file?.content ?? "");
  const [savedContent, setSavedContent] = useState(file?.content ?? "");
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const nextContent = file?.content ?? "";
    setDraft(nextContent);
    setSavedContent(nextContent);
    setError(null);
  }, [fileId])

  const isDirty = draft !== savedContent;
  const save = () => {
    if (!fileId || !file) return;
    try {
      updateFileContent(fileId, draft);
      setSavedContent(draft);
      setError(null);
    } catch (saveError) {
      console.error("Could not save file:", saveError);
      setError("Unable to save this file!");
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        save();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => { window.removeEventListener("keydown", handleKeyDown) };
  });

  if (!fileId) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6 text-center text-sm text-black/80">
        Open a text file from Files to begin editing.
      </div>
    );
  }

  if (!file) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center text-sm text-white/50">
        <CircleAlertIcon className="text-red-300" size={24} />
        <span>This file no longer exists.</span>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-zinc-950 text-white">
      <header className="flex h-10 shrink-0 items-center justify-between border-b border-white/10 bg-zinc-900 px-3">
        <div className="flex min-w-0 items-center gap-2">
          <FileTextIcon size={15} className="shrink-0 text-purple-300" />
          <span className="truncate text-xs text-white/75">{file.name}</span>

          {isDirty && (
            <span title="Unsaved changes" className="size-1.5 shrink-0 rounded-full bg-purple-400" />
          )}
        </div>

        <button
          type="button"
          onClick={save}
          disabled={!isDirty}
          title="Save file"
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-purple-200 transition hover:bg-purple-500/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
        >
          <SaveIcon size={14} /> Save
        </button>
      </header>

      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          setError(null);
        }}
        spellCheck={false}
        className="min-h-0 flex-1 resize-none overflow-auto bg-zinc-950 p-4 font-mono text-xs leading-6 text-white/80 outline-none selection:bg-purple-500/40"
        aria-label={`Editing ${file.name}`}
      />

      <footer className="flex h-7 shrink-0 items-center justify-between border-t border-white/10 bg-zinc-900 px-3 text-[10px] text-white/35">
        <span>{isDirty ? "Unsaved changes" : "Saved"}</span>
        <span>{error ?? "Ctrl+S to save"}</span>
      </footer>
    </div>
  );
}

export default TextEditor;