import { useRef, useState, useCallback } from "react";
import { SaveIcon, FileTextIcon, CircleAlertIcon } from "lucide-react";
import { useFileSystemStore } from "../../stores/FileSystemStore";

interface Props {
  width: number;
  height: number;
  fileId?: string;
}

function TextEditor({ fileId }: Props) {
  const file = useFileSystemStore((state) =>
    fileId ? state.getItem(fileId) : undefined,
  );
  const updateFileContent = useFileSystemStore(
    (state) => state.updateFileContent,
  );

  const initialContent = file?.content ?? "";
  const [draft, setDraft] = useState(initialContent);
  const [savedContent, setSavedContent] = useState(initialContent);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDirty = draft !== savedContent;
  const save = useCallback(() => {
    if (!fileId || !file) return;

    try {
      updateFileContent(fileId, draft);
      setSavedContent(draft);
      setError(null);
    } catch (saveError) {
      console.error("Could not save file:", saveError);
      setError("Unable to save this file.");
    }
  }, [draft, file, fileId, updateFileContent]);

  const handleEditorKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        save();
      }
    },
    [save],
  );

  if (!fileId) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6 text-center text-sm font-semibold text-zinc-950">
        Open a text file from Files to begin editing.
      </div>
    );
  }

  if (!file) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center text-sm font-semibold text-zinc-950">
        <CircleAlertIcon className="text-rose-600" size={24} strokeWidth={4} />
        <span>This file no longer exists.</span>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <header className="flex h-10 shrink-0 items-center justify-between px-3">
        <div className="flex min-w-0 items-center justify-center gap-2">
          <FileTextIcon
            size={12}
            strokeWidth={2}
            className="shrink-0 text-purple-950"
          />
          <span className="truncate text-xs font-semibold text-purple-950">
            {file.name}
          </span>

          {isDirty && (
            <span
              title="Unsaved changes"
              className="size-1.5 shrink-0 rounded-full bg-rose-950"
            />
          )}
        </div>

        <button
          type="button"
          onClick={save}
          disabled={!isDirty}
          title="Save file"
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-purple-950 transition hover:bg-violet-900/30 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SaveIcon size={12} strokeWidth={2} /> Save
        </button>
      </header>

      <div className="min-h-0 flex-1 p-1">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setError(null);
          }}
          onKeyDown={handleEditorKeyDown}
          spellCheck={false}
          className="size-full resize-none overflow-auto rounded-md bg-zinc-950 p-2 text-xs leading-6 text-white/80 outline-none selection:bg-purple-500/40"
          aria-label={`Editing ${file.name}`}
        />
      </div>

      <footer className="flex h-7 shrink-0 items-center justify-between px-3 text-[10px] font-semibold text-purple-950">
        <span>{isDirty ? "Unsaved changes" : "Saved"}</span>
        <span>{error ?? "Ctrl+S to save"}</span>
      </footer>
    </div>
  );
}

export default TextEditor;
