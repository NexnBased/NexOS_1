import { AnimatePresence, motion } from "motion/react";
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
  RotateCcwIcon,
  SearchIcon,
  Trash2Icon,
  VideoIcon,
  XIcon,
} from "lucide-react";
import {
  type FSItem,
  RootID as rootID,
  TrashID as trashID,
} from "../../types/filesystem";
import { useFileSystemStore } from "../../stores/FileSystemStore";
import { useWindowStore } from "../../stores/WindowStore";

const getFileCategory = (
  item: FSItem,
): "text" | "image" | "code" | "audio" | "video" => {
  if (item.type === "folder") {
    return "text";
  }

  if (item.mimeType?.startsWith("image/")) {
    return "image";
  }

  if (item.mimeType?.startsWith("audio/")) {
    return "audio";
  }

  if (item.mimeType?.startsWith("video/")) {
    return "video";
  }

  if (
    item.mimeType === "text/typescript" ||
    item.mimeType === "text/javascript" ||
    item.mimeType === "text/css"
  ) {
    return "code";
  }

  return "text";
};

const getFileIcon = (item: FSItem, size = 22) => {
  if (item.type === "folder") {
    return <FolderIcon size={size} />;
  }

  switch (getFileCategory(item)) {
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

const isEditableTextFile = (item: FSItem) => {
  if (item.type !== "file") return false;
  const category = getFileCategory(item);
  return category === "text" || category === "code";
};

const uniqueName = (items: FSItem[], parentId: string | null, name: string) => {
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

function Files() {
  const items = useFileSystemStore((state) => state.items);
  const createFolderInStore = useFileSystemStore((state) => state.createFolder);
  const createFileInStore = useFileSystemStore((state) => state.createFile);
  const renameItemInStore = useFileSystemStore((state) => state.renameItem);
  const moveToTrash = useFileSystemStore((state) => state.moveToTrash);
  const restoreItem = useFileSystemStore((state) => state.restoreItem);
  const permanentlyDeleteItem = useFileSystemStore(
    (state) => state.permanentlyDeleteItem,
  );
  const openWindow = useWindowStore((state) => state.openWindow);
  const [currentId, setCurrentId] = useState(rootID);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renameId) {
      requestAnimationFrame(() => {
        renameRef.current?.focus();
        renameRef.current?.select();
      });
    }
  }, [renameId]);

  const currentFolder = items.find(
    (item) => item.id === currentId && item.type === "folder",
  );
  const activeCurrentId = currentFolder ? currentId : rootID;
  const activeFolder =
    currentFolder ??
    items.find((item) => item.id === rootID && item.type === "folder");
  const currentItems = useMemo(() => {
    const children = items.filter((item) => item.parentId === activeCurrentId);
    if (!search.trim()) return children;
    const query = search.trim().toLowerCase();

    return children.filter((item) => item.name.toLowerCase().includes(query));
  }, [items, activeCurrentId, search]);
  const emptyTrash = useFileSystemStore((state) => state.emptyTrash);
  const breadcrumbs = useMemo(() => {
    const result: FSItem[] = [];
    let cursor = activeFolder;

    while (cursor) {
      result.unshift(cursor);
      if (cursor.parentId === null) break;
      cursor = items.find((item) => item.id === cursor?.parentId);
    }

    return result;
  }, [activeFolder, items]);
  const previewItem = previewId
    ? items.find((item) => item.id === previewId)
    : null;
  const navigate = (id: string) => {
    const destination = items.find(
      (item) => item.id === id && item.type === "folder",
    );
    if (!destination || destination.id === activeCurrentId) return;

    setCurrentId(destination.id);
    setSelectedId(null);
    setSearch("");
  };

  const createFolder = () => {
    const name = uniqueName(items, activeCurrentId, "New Folder");

    try {
      createFolderInStore(name, activeCurrentId);
      setShowCreateMenu(false);
    } catch (error) {
      console.error("Could not create folder:", error);
    }
  };

  const createTextFile = () => {
    const name = uniqueName(items, activeCurrentId, "readme.txt");

    try {
      createFileInStore(name, activeCurrentId, "", "text/plain");
      setShowCreateMenu(false);
    } catch (error) {
      console.error("Could not create file:", error);
    }
  };

  const beginRename = (item: FSItem) => {
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

    try {
      renameItemInStore(renameId, trimmed);
    } catch (error) {
      console.error("Could not rename item:", error);
    }
    setRenameId(null);
  };

  const handleRestore = (id: string) => {
    try {
      restoreItem(id);
      setSelectedId(null);
    } catch (error) {
      console.error("Could not restore item:", error);
    }
  };

  const permanentlyDelete = (id: string) => {
    try {
      permanentlyDeleteItem(id);
      setSelectedId(null);
    } catch (error) {
      console.error("Could not permanently delete item:", error);
    }
  };

  const handleMoveToTrash = (id: string) => {
    try {
      moveToTrash(id);
      setSelectedId(null);
    } catch (error) {
      console.error("Could not move item to Trash:", error);
    }
  };

  const handleEmptryTrash = () => {
    try {
      emptyTrash();
      setSelectedId(null);
    } catch (error) {
      console.error("Couldn't empty Trash:", error);
    }
  };

  const handleItemDoubleClick = (item: FSItem) => {
    if (item.type === "folder") {
      navigate(item.id);
      return;
    }

    if (isEditableTextFile(item)) {
      openWindow("text-editor", { fileId: item.id });
      return;
    }

    setPreviewId(item.id);
  };

  const handleItemClick = (item: FSItem) => {
    setSelectedId(item.id);
  };

  const handleBackgroundClick = () => {
    setSelectedId(null);
    setShowCreateMenu(false);
  };

  const sidebarItems = [
    { id: rootID, name: "Home", icon: HomeIcon },
    { id: "documents", name: "Documents", icon: FileTextIcon },
    { id: "downloads", name: "Downloads", icon: ArchiveIcon },
    { id: "pictures", name: "Pictures", icon: FileImageIcon },
    { id: "music", name: "Music", icon: MusicIcon },
    { id: "videos", name: "Videos", icon: VideoIcon },
    { id: trashID, name: "Trash", icon: Trash2Icon },
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
              const active = activeCurrentId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.id)}
                  title={item.name}
                  className={[
                    "flex h-9 w-full shrink-0 items-center rounded-md! text-left text-sm transition gap-3 px-3",
                    active
                      ? "bg-purple-200/70 text-purple-950"
                      : "text-zinc-700 hover:bg-purple-100/70 hover:text-purple-900",
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
              {breadcrumbs.map((item, index) => (
                <div key={item.id} className="flex shrink-0 items-center">
                  {index > 0 && (
                    <ChevronRightIcon
                      size={13}
                      className="mx-1 shrink-0 text-white/20"
                    />
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
            {activeCurrentId === trashID && (
              <div className="flex justify-end border-b border-white/5 p-2">
                <button
                  type="button"
                  onClick={handleEmptryTrash}
                  className="rounded-md px-2 py-1 text-xs text-red-300 transition hover:bg-red-400/10 hover:text-red-200"
                >
                  Empty Trash
                </button>
              </div>
            )}
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
                <p className="text-sm text-white/45">
                  {search ? "No matching files" : "This folder is empty"}
                </p>
                <p className="mt-1 text-xs text-white/20">
                  {search
                    ? "Try a different search."
                    : "Create a folder or file."}
                </p>
              </div>
            </div>
          ) : (
            <div
              className="grid content-start gap-2 p-3"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(84px, 92px))",
              }}
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
                        {activeCurrentId === trashID && (
                          <button
                            type="button"
                            title="Restore"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleRestore(item.id);
                            }}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-white/35 hover:bg-white/8 hover:text-purple-300"
                          >
                            <RotateCcwIcon size={12} />
                          </button>
                        )}

                        {activeCurrentId !== trashID && (
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
                        )}

                        <button
                          type="button"
                          title={
                            activeCurrentId === trashID
                              ? "Delete permanently"
                              : "Move to Trash"
                          }
                          onClick={(event) => {
                            event.stopPropagation();
                            if (activeCurrentId === trashID)
                              permanentlyDelete(item.id);
                            else handleMoveToTrash(item.id);
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-white/35 hover:bg-white/8 hover:text-red-300"
                        >
                          <Trash2Icon size={12} />
                        </button>
                      </div>
                    )}
                    {selected &&
                      !renaming &&
                      item.type === "file" &&
                      isEditableTextFile(item) && (
                        <button
                          type="button"
                          title="Open in Text Editor"
                          onClick={(event) => {
                            event.stopPropagation();

                            openWindow("texteditor", {
                              fileId: item.id,
                            });
                          }}
                          className="flex h-6 items-center gap-1 rounded-md px-2 text-[10px] text-purple-200 hover:bg-purple-500/15"
                        >
                          Open
                        </button>
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
                <div className="shrink-0 text-white/45">
                  {getFileIcon(previewItem, 16)}
                </div>
                <span className="truncate text-xs text-white/65">
                  {previewItem.name}
                </span>
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
              {getFileCategory(previewItem) === "text" ||
              getFileCategory(previewItem) === "code" ? (
                <pre className="whitespace-pre-wrap wrap-break-words rounded-xl bg-black/20 p-4 text-xs leading-6 text-white/65">
                  {previewItem.content || "Empty file"}
                </pre>
              ) : getFileCategory(previewItem) === "image" ? (
                <div className="flex min-h-45 items-center justify-center rounded-xl bg-black/20 p-6">
                  <div className="flex flex-col items-center gap-2 text-white/25">
                    <FileImageIcon size={42} strokeWidth={1.4} />
                    <span className="text-xs">Image preview unavailable</span>
                  </div>
                </div>
              ) : getFileCategory(previewItem) === "audio" ? (
                <div className="flex min-h-45 flex-col items-center justify-center gap-4 rounded-xl bg-black/20">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-white/35">
                    <MusicIcon size={28} />
                  </div>
                  <span className="text-xs text-white/40">
                    Audio preview unavailable
                  </span>
                </div>
              ) : getFileCategory(previewItem) === "video" ? (
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
