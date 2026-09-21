import { useRef, useState, useEffect } from "react";
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

  const [draft, setDraft] = useState(file?.content ?? "");
  const [savedContent, setSavedContent] = useState(file?.content ?? "");
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const nextContent = file?.content ?? "";
    setDraft(nextContent);
    setSavedContent(nextContent);
    setError(null);
  }, [fileId]);

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
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  if (!fileId) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6 text-center text-sm font-semibold text-zinc-950">
        Open a text file from Files to begin editing.
      </div>
    );
  }

  if (!file) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center text-sm font-semi-bold text-zinc-950">
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
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-purple-950 transition hover:bg-violet-900/30 disabled:cursor-not-allowed"
        >
          <SaveIcon size={12} strokeWidth={2} /> Save
        </button>
      </header>

      <div className="size-full p-1">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setError(null);
          }}
          spellCheck={false}
          className="min-h-0 size-full rounded-md flex-1 resize-none overflow-auto bg-zinc-950 p-2 text-xs leading-6 text-white/80 outline-none selection:bg-purple-500/40"
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
