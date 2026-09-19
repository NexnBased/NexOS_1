import { AnimatePresence, motion } from "motion/react"
import { useRef, useMemo, useState, useEffect } from "react";
import {
  ArchiveIcon,
  ChevronRightIcon,
  FileCode2Icon,
  FileIcon,
  FileImageIcon,
  FileMusicIcon,
  FileTextIcon,
  FileVideo2Icon,
  FolderIcon,
  FolderOpenIcon,
  HomeIcon,
  MusicIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  VideoIcon,
  XIcon,
} from "lucide-react";

type ItemType = "file" | "folder";
type FileType = "text" | "image" | "code" | "audio" | "video";

interface VFSItem {
  id: string;
  name: string;
  type: ItemType;
  parentId: string | null;
  fileType?: FileType;
  content?: string;
  size?: number;
}

interface Props {
  width: number;
  height: number;
}

const StorageKey = "nexos.fs";
const createId = () => crypto.randomUUID();

const initItems: VFSItem[] = [
  { id: "home", name: "Home", type: "folder", parentId: null },
  { id: "desktop", name: "Desktop", type: "folder", parentId: "home" },
  { id: "documents", name: "Documents", type: "folder", parentId: "home" },
  { id: "downloads", name: "Downloads", type: "folder", parentId: "home" },
  { id: "pictures", name: "Pictures", type: "folder", parentId: "home" },
  { id: "music", name: "Music", type: "folder", parentId: "home" },
  { id: "videos", name: "Videos", type: "folder", parentId: "home" },
  { id: "trash", name: "Trash", type: "folder", parentId: null },
  {
    id: "welcome",
    name: "welcome.txt",
    type: "file",
    parentId: "home",
    fileType: "text",
    content:
      "Welcome to NexOS.\n\nThis is a virtual file stored inside the NexOS filesystem.",
    size: 86,
  },
  {
    id: "app",
    name: "App.tsx",
    type: "file",
    parentId: "documents",
    fileType: "code",
    content:
      'import React from "react";\n\nexport default function App() {\n return <div>NexOS</div>;\n}',
    size: 92,
  },
  {
    id: "wallpaper",
    name: "wallpaper.jpg",
    type: "file",
    parentId: "pictures",
    fileType: "image",
    size: 2048,
  },
  {
    id: "ambient",
    name: "ambient.mp3",
    type: "file",
    parentId: "music",
    fileType: "audio",
    size: 4096,
  },
  {
    id: "demo",
    name: "demo.mp4",
    type: "file",
    parentId: "videos",
    fileType: "video",
    size: 8192,
  },
];

const loadItems = (): VFSItem[] => {
  try {
    const stored = localStorage.getItem(StorageKey);
    if (!stored) {
      localStorage.setItem(StorageKey, JSON.stringify(initItems));
      return initItems;
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(StorageKey, JSON.stringify(initItems));
      return initItems;
    }

    const existingIds = new Set(parsed.map((item: VFSItem) => item.id));
    const missingItems = initItems.filter((item) => !existingIds.has(item.id));
    if (missingItems.length > 0) {
      const mergedItems = [...parsed, ...missingItems];
      localStorage.setItem(StorageKey, JSON.stringify(mergedItems));

      return mergedItems;
    }

    return parsed;
  } catch {
    localStorage.setItem(StorageKey, JSON.stringify(initItems));
    return initItems;
  }
};

const saveItems = (items: VFSItem[]) => {
  localStorage.setItem(StorageKey, JSON.stringify(items));
};

const getFileIcon = (item: VFSItem, size = 22) => {
  if (item.type === "folder") {
    return <FolderIcon size={size} />;
  }

  switch (item.fileType) {
    case "image":
      return <FileImageIcon size={size} />;
    case "code":
      return <FileCode2Icon size={size} />;
    case "audio":
      return <FileMusicIcon size={size} />;
    case "video":
      return <FileVideo2Icon size={size} />;
    default:
      return <FileTextIcon size={size} />;
  }
};

const uniqueName = (
  items: VFSItem[],
  parentId: string | null,
  name: string,
) => {
  const names = new Set(
    items
      .filter((item) => item.parentId === parentId)
      .map((item) => item.name.toLowerCase()),
  );

  if (!names.has(name.toLowerCase())) {
    return name;
  }
  const dot = name.lastIndexOf(".");
  const extension = dot > 0 ? name.slice(dot) : "";
  const base = dot > 0 ? name.slice(0, dot) : name;

  let index = 2;
  let candicate = `${base} ${index}${extension}`;

  while (names.has(candicate.toLowerCase())) {
    index += 1;
    candicate = `${base} ${index}${extension}`;
  }

  return candicate;
};

function Files({ width: _width, height: _height }: Props) {
  const [items, setItems] = useState<VFSItem[]>(loadItems);
  const [currentId, setCurrentId] = useState("home");
  const [history, setHistory] = useState<string[]>(["home"]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveItems(items);
  }, [items]);
  useEffect(() => {
    if (renameId) {
      requestAnimationFrame(() => {
        renameRef.current?.focus();
        renameRef.current?.select();
      });
    }
  }, [renameId]);

  const currentFolder = items.find((item) => item.id === currentId);
  const currentItems = useMemo(() => {
    const children = items.filter((item) => item.parentId === currentId);
    if (!search.trim()) {
      return children;
    }
    const query = search.toLowerCase();

    return children.filter((item) => item.name.toLowerCase().includes(query));
  }, [items, currentId, search]);
  const breadcrumps = useMemo(() => {
    const result: VFSItem[] = [];
    let cursor = currentFolder;
    while (cursor) {
      result.unshift(cursor);
      if (!cursor.parentId) {
        break;
      }
      cursor = items.find((item) => item.id === cursor?.parentId);
    }

    return result;
  }, [currentFolder, items]);
  const previewItem = previewId
    ? items.find((item) => item.id === previewId)
    : null;
  const navigate = (id: string) => {
    if (id === currentId) return;
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(id);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setCurrentId(id);
    setSelectedId(null);
    setSearch("");
  };

  const createFolder = () => {
    const name = uniqueName(items, currentId, "New Folder");
    setItems((prev) => [
      ...prev,
      {
        id: createId(),
        name,
        type: "folder",
        parentId: currentId,
      },
    ]);
    setShowCreateMenu(false);
  };

  const createTextFile = () => {
    const name = uniqueName(items, currentId, "readme.txt");
    setItems((prev) => [
      ...prev,
      {
        id: createId(),
        name,
        type: "file",
        parentId: currentId,
        fileType: "text",
        content: "",
        size: 0,
      },
    ]);
    setShowCreateMenu(false);
  };

  const beginRename = (item: VFSItem) => {
    setRenameId(item.id);
    setRenameValue(item.name);
  };

  const finishRename = () => {
    if (!renameId) return;
    const target = items.find((item) => item.id === renameId);
    if (!target) {
      setRenameId(null);
      return;
    }
    const trimmed = renameValue.trim();
    if (!trimmed) {
      setRenameId(null);
      return;
    }
    const name = uniqueName(
      items.filter((item) => item.id !== target.id),
      target.parentId,
      trimmed,
    );
    setItems((previous) =>
      previous.map((item) => (item.id === renameId ? { ...item, name } : item)),
    );
    setRenameId(null);
  };

  const deleteItem = (id: string) => {
    const target = items.find((item) => item.id === id);
    if (!target || id === "home" || id === "trash") return;
    const descendants = new Set<string>();
    const collect = (parentId: string) => {
      items.forEach((item) => {
        if (item.parentId === parentId) {
          descendants.add(item.id);
          if (item.type === "folder") {
            collect(item.id);
          }
        }
      });
    };
    if (target.type === "folder") {
      collect(id);
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id || descendants.has(item.id)) {
          return {
            ...item,
            parentId: "trash",
          };
        }

        return item;
      }),
    );

    setSelectedId(null);
  };

  const permanentlyDelete = (id: string) => {
    const descendants = new Set<string>();
    const collect = (parentId: string) => {
      items.forEach((item) => {
        if (item.parentId === parentId) {
          descendants.add(item.id);
          if (item.type === "folder") {
            collect(item.id);
          }
        }
      });
    };
    collect(id);
    setItems((prev) =>
      prev.filter((item) => item.id !== id && !descendants.has(item.id)),
    );

    setSelectedId(null);
  };

  const handleItemDoubleClick = (item: VFSItem) => {
    if (item.type === "folder") {
      navigate(item.id);
      return;
    }
    setPreviewId(item.id);
  };

  const handleItemClick = (item: VFSItem) => {
    setSelectedId(item.id);
  };

  const handleBackgroundClick = () => {
    setSelectedId(null);
    setShowCreateMenu(false);
  };

  const sidebarItems = [
    { id: "home", name: "Home", icon: HomeIcon },
    { id: "documents", name: "Documents", icon: FileTextIcon },
    { id: "downloads", name: "Downloads", icon: ArchiveIcon },
    { id: "pictures", name: "Pictures", icon: FileImageIcon },
    { id: "music", name: "Music", icon: MusicIcon },
    { id: "videos", name: "Videos", icon: VideoIcon },
    { id: "trash", name: "Trash", icon: Trash2Icon },
  ];

  return (
    <div
      className="relative flex h-full w-full min-h-0 min-w-0 overflow-hidden"
      onClick={handleBackgroundClick}
    >
      <aside
        className="shrink-0 w-48"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-full min-h-0 flex-col p-2">
          <div className="px-3 pb-3 pt-2 text-xs font-semibold uppercase tracking-wide text-zinc-900">
            Places
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = currentId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.id)}
                  title={item.name}
                  className={[
                    "flex h-9 w-full shrink-0 items-center rounded-md! text-left text-sm transition gap-3 px-3",
                    active
                      ? "bg-zinc-900/10 text-zinc-950"
                      : "text-zinc-900/55 hover:bg-zinc-800/20 hover:text-zinc-300",
                  ].join(" ")}
                >
                  <Icon size={17} strokeWidth={1.8} />
                  <span className="min-w-0 truncate">{item.name}</span>
                </button>
              );
            })}
          </div>
          <div className="w-full flex flex-col gap-1 items-center justify-center">
            <div className="w-full relative shrink-0">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setShowCreateMenu((value) => !value);
                }}
                title="New"
                className={`flex h-8 w-full items-center justify-start p-1.5 gap-2 rounded-md! text-white/55 transition bg-zinc-900 hover:bg-zinc-600 hover:text-white ${showCreateMenu == true && "bg-white/[0.07] text-white"}`}
              >
                <PlusIcon size={17} /> Create
              </button>
              <AnimatePresence>
                {showCreateMenu && (
                  <motion.div
                    className="absolute bottom-10 z-30 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#1b1922] p-1.5"
                    onClick={(event) => event.stopPropagation()}
                    initial={{ y: "100%", opacity: 0, scale: 0 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: "100%", opacity: 0, scale: 0 }}
                    transition={{
                      opacity: { duration: 0.15 },
                      y: { type: "spring", stiffness: 300, damping: 25 },
                      scale: { type: "spring", stiffness: 300, damping: 25 },
                    }}
                  >
                    <button
                      type="button"
                      onClick={createFolder}
                      className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-xs text-white/70 hover:bg-white/[0.07] hover:text-white"
                    >
                      <FolderIcon size={15} /> New Folder
                    </button>
                    <button
                      type="button"
                      onClick={createTextFile}
                      className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-xs text-white/70 hover:bg-white/[0.07] hover:text-white"
                    >
                      <FileTextIcon size={15} /> Text File
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex h-8 p-2 shrink-0 items-center rounded-md! bg-zinc-900 w-full">
              <SearchIcon size={15} className="shrink-0 text-white/30" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search"
                className="h-full min-w-0 flex-1 bg-transparent px-2 text-xs text-white outline-none placeholder:text-white/25 placeholder:text-[14px]"
              />
            </div>
          </div>
        </div>
      </aside>
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-1">
        <header
          className="flex h-11 shrink-0 items-center gap-1 border-b border-white/7 bg-zinc-900 px-2 rounded-t-md"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex min-w-0 flex-1 items-center overflow-hidden">
            <div className="flex min-w-0 items-center overflow-x-auto scrollbar-none">
              {breadcrumps.map((item, index) => (
                <div key={item.id} className="flex shrink-0 items-center">
                  {index > 0 && (
                    <ChevronRightIcon size={13} className="mx-1 shrink-0 text-white/20" />
                  )}
                  <button
                    type="button"
                    onClick={() => navigate(item.id)}
                    className={[
                      "max-w-35 truncate rounded-md! px-2 py-1 text-xs transition",
                      item.id === currentId
                        ? "bg-white/15 text-white/80"
                        : "text-white/40 hover:bg-white/5 hover:text-white/70",
                    ].join(" ")}
                  >
                    {item.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </header>
        <section
          className="relative min-h-0 min-w-0 flex-1 overflow-auto bg-zinc-950 rounded-b-md"
          onClick={handleBackgroundClick}
        >
          {currentItems.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="flex max-w-60 flex-col items-center text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/4 text-white/20">
                  <FolderOpenIcon size={27} strokeWidth={1.5} />
                </div>
                <p className="text-sm text-white/45">{search ? "No matching files" : "This folder is empty"}</p>
                <p className="mt-1 text-xs text-white/20">
                  {search ? "Try a different search." : "Create a folder or file."}
                </p>
              </div>
            </div>
          ) : (
            <div
              className="grid content-start gap-2 p-3"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(84px, 92px))" }}
            >
              {currentItems.map((item) => {
                const selected = selectedId === item.id;
                const renaming = renameId === item.id;
                return (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleItemClick(item);
                    }}
                    onDoubleClick={(event) => {
                      event.stopPropagation();
                      handleItemDoubleClick(item);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !renaming) {
                        handleItemDoubleClick(item);
                      }
                    }}
                    className={[
                      "group flex min-w-0 flex-col items-center rounded-xl p-2 outline-none transition",
                      selected ? "bg-white/9" : "hover:bg-white/4.5",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "flex h-14 w-14 items-center justify-center rounded-xl transition",
                        item.type === "folder"
                          ? "bg-[#292435] text-[#b9a4ff]"
                          : "bg-white/4.5 text-white/55",
                        selected ? "ring-1 ring-white/15" : "",
                      ].join(" ")}
                    >
                      {getFileIcon(item, 27)}
                    </div>
                    <div className="mt-2 w-full min-w-0 text-center">
                      {renaming ? (
                        <input
                          ref={renameRef}
                          value={renameValue}
                          onChange={(event) =>
                            setRenameValue(event.target.value)
                          }
                          onBlur={finishRename}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              finishRename();
                            }
                            if (event.key === "Escape") {
                              setRenameId(null);
                            }
                          }}
                          onClick={(event) => event.stopPropagation()}
                          className="h-6 w-full min-w-0 rounded border border-white/15 bg-black/30 px-1 text-center text-[11px] text-white outline-none"
                        />
                      ) : (
                        <div
                          className="truncate px-0.5 text-[11px] text-white/60"
                          title={item.name}
                        >
                          {item.name}
                        </div>
                      )}
                    </div>
                    {selected && !renaming && (
                      <div className="mt-1 flex items-center gap-1">
                        <button
                          type="button"
                          title="Rename"
                          onClick={(event) => {
                            event.stopPropagation();
                            beginRename(item);
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-white/35 hover:bg-white/8 hover:text-white"
                        >
                          <PencilIcon size={12} />
                        </button>
                        <button
                          type="button"
                          title={
                            currentId === "trash"
                              ? "Delete permanently"
                              : "Move to Trash"
                          }
                          onClick={(event) => {
                            event.stopPropagation();
                            if (currentId === "trash") {
                              permanentlyDelete(item.id);
                            } else {
                              deleteItem(item.id);
                            }
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-white/35 hover:bg-white/8 hover:text-red-300"
                        >
                          <Trash2Icon size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
      {previewItem && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/65 p-3 backdrop-blur-sm"
          onClick={() => setPreviewId(null)}
        >
          <div
            className="flex max-h-full w-[min(620px,calc(100%-24px))] max-w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#18161e] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/[0.07] px-3">
              <div className="flex min-w-0 items-center gap-2">
                <div className="shrink-0 text-white/45">{getFileIcon(previewItem, 16)}</div>
                <span className="truncate text-xs text-white/65">{previewItem.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewId(null)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/40 hover:bg-white/[0.07] hover:text-white"
              >
                <XIcon size={16} />
              </button>
            </div>
            <div className="min-h-0 overflow-auto p-4">
              {previewItem.fileType === "text" ||
                previewItem.fileType === "code" ? (
                <pre className="whitespace-pre-wrap wrap-break-words rounded-xl bg-black/20 p-4 text-xs leading-6 text-white/65">
                  {previewItem.content || "Empty file"}
                </pre>
              ) : previewItem.fileType === "image" ? (
                <div className="flex min-h-45 items-center justify-center rounded-xl bg-black/20 p-6">
                  <div className="flex flex-col items-center gap-2 text-white/25">
                    <FileImageIcon size={42} strokeWidth={1.4} />
                    <span className="text-xs">Image preview unavailable</span>
                  </div>
                </div>
              ) : previewItem.fileType === "audio" ? (
                <div className="flex min-h-45 flex-col items-center justify-center gap-4 rounded-xl bg-black/20">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-white/35">
                    <MusicIcon size={28} />
                  </div>
                  <span className="text-xs text-white/40">
                    Audio preview unavailable
                  </span>
                </div>
              ) : previewItem.fileType === "video" ? (
                <div className="flex min-h-45 items-center justify-center rounded-xl bg-black/20">
                  <div className="flex flex-col items-center gap-2 text-white/25">
                    <VideoIcon size={42} strokeWidth={1.4} />
                    <span className="text-xs">Video preview unavailable</span>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-45 items-center justify-center rounded-xl bg-black/20">
                  <FileIcon size={42} className="text-white/25" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Files;
