import React, { useState, useEffect } from "react";
import { Trash2Icon, FileTextIcon } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

const StorageKey = "NexOS_notes";
const MaxNotes = 10;
const MaxChars = 200;

function Notes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(StorageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: "1",
        title: "",
        content: "Write whatever you want to!",
        updatedAt: Date.now(),
      },
    ];
  });

  const [activeId, setActiveId] = useState<string>(() => notes[0]?.id || "");
  useEffect(() => {
    localStorage.setItem(StorageKey, JSON.stringify(notes));
  }, [notes]);
  const activeNote = notes.find((n) => n.id === activeId);

  const addNote = () => {
    if (notes.length >= MaxNotes) return;
    const newNote: Note = {
      id: Date.now().toString(),
      title: "",
      content: "",
      updatedAt: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setActiveId(newNote.id);
  };

  const updateNote = (field: "title" | "content", value: string) => {
    const nextValue = field === "content" ? value.slice(0, MaxChars) : value;
    setNotes(
      notes.map((n) =>
        n.id === activeId
          ? { ...n, [field]: nextValue, updatedAt: Date.now() }
          : n,
      ),
    );
  };

  const deleteNote = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const filtered = notes.filter((n) => n.id !== id);
    setNotes(filtered);
    if (activeId === id) {
      setActiveId(filtered[0]?.id || "");
    }
  };

  return (
    <div className="w-full h-full flex select-none overflow-hidden">
      <div className="w-48 flex flex-col shrink-0">
        <div className="p-2 flex items-center justify-between">
          <button
            onClick={addNote}
            disabled={notes.length >= MaxNotes}
            className={`w-full py-1 px-2 text-[11px] font-medium rounded-md! transition-colors ${
              notes.length >= MaxNotes
                ? "bg-zinc-800/40 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white"
            }`}
          >
            New Note
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
          {notes.length === 0 ? (
            <div className="p-4 text-center text-[10px] text-purple-950">
              Empty!
            </div>
          ) : (
            notes.map((note) => {
              const active = note.id === activeId;
              return (
                <div
                  key={note.id}
                  onClick={() => setActiveId(note.id)}
                  className={`group relative p-2 rounded-md cursor-pointer transition-colors flex flex-col gap-0.5 ${
                    active
                      ? "bg-purple-200/50 text-black/80"
                      : "hover:bg-purple-200/20 text-black/40 hover:text-black/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-bold tracking-tight truncate flex-1">
                      {note.title.trim() || "Untitled"}
                    </span>
                    <button
                      onClick={(e) => deleteNote(note.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-black/50 hover:text-rose-400 transition-opacity"
                    >
                      <Trash2Icon className="size-3" strokeWidth={3} />
                    </button>
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate opacity-70 font-mono">
                    {note.content || "Empty note"}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col bg-neutral-950 rounded-lg m-1">
        {activeNote ? (
          <>
            <div className="px-3 py-2 border-b border-zinc-800/80 flex items-center justify-between">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => updateNote("title", e.target.value)}
                placeholder="Title..."
                className="bg-transparent text-xs font-semibold text-zinc-100 placeholder:text-zinc-600 focus:outline-none flex-1 tracking-wide"
              />
              <button
                onClick={(e) => deleteNote(activeNote.id, e)}
                className="text-white/50 hover:text-rose-400 transition-colors p-1"
                title="Delete note"
              >
                <Trash2Icon className="size-4" strokeWidth={2} />
              </button>
            </div>

            <textarea
              value={activeNote.content}
              onChange={(e) => updateNote("content", e.target.value)}
              maxLength={MaxChars}
              placeholder="Start typing..."
              className="flex-1 w-full p-4 bg-transparent text-xs text-zinc-300 placeholder:text-zinc-700 resize-none focus:outline-none leading-relaxed selection:bg-violet-950 selection:text-purple-100 font-mono"
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/60 gap-2">
            <FileTextIcon className="size-6 text-white/70" />
            {notes.length === 0 ? (
              <span className="text-xs text-white/60">Create a new Note</span>
            ) : (
              <span className="text-xs text-white/60">No note selected</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notes;
