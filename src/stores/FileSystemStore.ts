import { create } from "zustand";
import {
  type FSItem,
  type FSMimeType,
  FSStorageKey as StorageKey,
  RootID,
  TrashID,
} from "../types/filesystem";

const StorageVersion = 1;
interface PersistedFS {
  version: number;
  items: FSItem[];
}

interface FileSystemStore {
  items: FSItem[];
  createFolder: (name: string, parentId: string | null) => string;
  createFile: (
    name: string,
    parentId: string | null,
    content?: string,
    mimeType?: FSMimeType,
  ) => string;
  getItem: (id: string) => FSItem | undefined;
  getChildren: (parentId: string | null) => FSItem[];
  getPath: (id: string) => FSItem[];
  renameItem: (id: string, name: string) => void;
  updateFileContent: (id: string, content: string) => void;
  moveItem: (id: string, parentId: string | null) => void;
  moveToTrash: (id: string) => void;
  restoreItem: (id: string) => void;
  permanentlyDeleteItem: (id: string) => void;
  emptyTrash: () => void;
  resetFileSystem: () => void;
}

const generateId = () => {
  return crypto.randomUUID();
};
const createInitFS = (): FSItem[] => {
  const now = Date.now();

  return [
    {
      id: RootID,
      name: "Home",
      type: "folder",
      parentId: null,
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "desktop",
      name: "Desktop",
      type: "folder",
      parentId: RootID,
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "documents",
      name: "Documents",
      type: "folder",
      parentId: RootID,
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "downloads",
      name: "Downloads",
      type: "folder",
      parentId: RootID,
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "pictures",
      name: "Pictures",
      type: "folder",
      parentId: RootID,
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "music",
      name: "Music",
      type: "folder",
      parentId: RootID,
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "videos",
      name: "Videos",
      type: "folder",
      parentId: RootID,
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: TrashID,
      name: "Trash",
      type: "folder",
      parentId: null,
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "welcome",
      name: "welcome.txt",
      type: "file",
      parentId: RootID,
      content:
        "Welcome to NexOS.\n\nThis is a virtual file stored inside the NexOS filesystem.",
      mimeType: "text/plain",
      createdAt: now,
      modifiedAt: now,
    },
  ];
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const getLegacyMimeType = (fileType: unknown, name: string): FSMimeType => {
  if (typeof fileType === "string") {
    switch (fileType) {
      case "image":
        return "image/*";
      case "audio":
        return "audio/*";
      case "video":
        return "video/*";
      case "code":
        return "text/typescript";
      case "text":
        return "text/plain";
    }
  }

  const extension = name.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "ts":
    case "tsx":
      return "text/typescript";
    case "js":
    case "jsx":
      return "text/javascript";
    case "css":
      return "text/css";
    case "md":
      return "text/markdown";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
      return "image/*";
    case "mp3":
    case "wav":
    case "ogg":
      return "audio/*";
    case "mp4":
    case "webm":
      return "video/*";
    default:
      return "application/octet-stream";
  }
};

const isFSMimeType = (value: unknown): value is FSMimeType => {
  return (
    typeof value === "string" &&
    (value === "text/plain" ||
      value === "text/markdown" ||
      value === "text/typescript" ||
      value === "text/javascript" ||
      value === "text/css" ||
      value === "image/*" ||
      value === "audio/*" ||
      value === "video/*" ||
      value === "application/octet-stream")
  );
};

const normalizeItems = (value: unknown): FSItem[] => {
  if (!Array.isArray(value)) {
    return createInitFS();
  }

  const now = Date.now();

  const items: FSItem[] = value
    .filter(isRecord)
    .filter(
      (item) =>
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        (item.type === "file" || item.type === "folder"),
    )
    .map((item) => {
      const isFile = item.type === "file";
      const name = item.name as string;
      const content =
        typeof item.content === "string" ? item.content : undefined;

      return {
        id: item.id as string,
        name,
        type: item.type as FSItem["type"],
        parentId:
          typeof item.parentId === "string" || item.parentId === null
            ? (item.parentId as string | null)
            : RootID,
        content: isFile ? content : undefined,
        mimeType: isFile
          ? isFSMimeType(item.mimeType)
            ? item.mimeType
            : getLegacyMimeType(item.fileType, name)
          : undefined,
        createdAt: typeof item.createdAt === "number" ? item.createdAt : now,
        modifiedAt: typeof item.modifiedAt === "number" ? item.modifiedAt : now,
        trashedFrom:
          typeof item.trashedFrom === "string" || item.trashedFrom === null
            ? (item.trashedFrom as string | null)
            : undefined,
      };
    });

  const ensureFolder = (id: string, name: string, parentId: string | null) => {
    if (!items.some((item) => item.id === id)) {
      items.unshift({
        id,
        name,
        type: "folder",
        parentId,
        createdAt: now,
        modifiedAt: now,
      });
    }
  };

  ensureFolder(RootID, "Home", null);
  ensureFolder(TrashID, "Trash", null);

  return items;
};

const loadFS = (): FSItem[] => {
  try {
    const stored = localStorage.getItem(StorageKey);

    if (!stored) {
      const initialItems = createInitFS();
      saveFS(initialItems);
      return initialItems;
    }

    const parsed: unknown = JSON.parse(stored);

    const rawItems =
      isRecord(parsed) &&
      parsed.version === StorageVersion &&
      Array.isArray(parsed.items)
        ? parsed.items
        : parsed;

    const normalizedItems = normalizeItems(rawItems);
    saveFS(normalizedItems);

    return normalizedItems;
  } catch {
    const initialItems = createInitFS();
    saveFS(initialItems);
    return initialItems;
  }
};

function saveFS(items: FSItem[]) {
  const payload: PersistedFS = {
    version: StorageVersion,
    items,
  };

  localStorage.setItem(StorageKey, JSON.stringify(payload));
}

const normalizeName = (name: string) => {
  return name.trim().toLowerCase();
};

const hasDuplicateName = (
  items: FSItem[],
  name: string,
  parentId: string | null,
  excludeId?: string,
) => {
  const normalizedName = normalizeName(name);

  return items.some(
    (item) =>
      item.parentId === parentId &&
      item.id !== excludeId &&
      normalizeName(item.name) === normalizedName,
  );
};

const isDescendant = (
  items: FSItem[],
  itemId: string,
  possibleAncestorId: string,
): boolean => {
  let current = items.find((item) => item.id === itemId);

  while (current?.parentId !== null && current?.parentId !== undefined) {
    if (current.parentId === possibleAncestorId) {
      return true;
    }

    current = items.find((item) => item.id === current?.parentId);
  }

  return false;
};

export const useFileSystemStore = create<FileSystemStore>((set, get) => ({
  items: loadFS(),
  createFolder: (name, parentId) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error("Folder name cannot be empty");
    }
    const state = get();
    if (
      parentId !== null &&
      !state.items.some(
        (item) => item.id === parentId && item.type === "folder",
      )
    ) {
      throw new Error("Parent folder does not exist");
    }
    if (hasDuplicateName(state.items, trimmedName, parentId)) {
      throw new Error("An item with that name already exists");
    }

    const now = Date.now();
    const newFolder: FSItem = {
      id: generateId(),
      name: trimmedName,
      type: "folder",
      parentId,
      createdAt: now,
      modifiedAt: now,
    };
    const items = [...state.items, newFolder];
    saveFS(items);
    set({ items });

    return newFolder.id;
  },
  createFile: (name, parentId, content = "", mimeType = "text/plain") => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error("File name cannot be empty");
    }

    const state = get();
    if (
      parentId !== null &&
      !state.items.some(
        (item) => item.id === parentId && item.type === "folder",
      )
    ) {
      throw new Error("Parent folder does not exist");
    }

    if (hasDuplicateName(state.items, trimmedName, parentId)) {
      throw new Error("An item with that name already exists");
    }

    const now = Date.now();
    const newFile: FSItem = {
      id: generateId(),
      name: trimmedName,
      type: "file",
      parentId,
      content,
      mimeType,
      createdAt: now,
      modifiedAt: now,
    };

    const items = [...state.items, newFile];
    saveFS(items);
    set({ items });

    return newFile.id;
  },
  getItem: (id) => {
    return get().items.find((item) => item.id === id);
  },
  getChildren: (parentId) => {
    return get()
      .items.filter((item) => item.parentId === parentId)
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === "folder" ? -1 : 1;
        }

        return a.name.localeCompare(b.name);
      });
  },
  getPath: (id) => {
    const state = get();
    const path: FSItem[] = [];
    let current = state.items.find((item) => item.id === id);

    while (current) {
      path.unshift(current);
      if (current.parentId === null) break;
      current = state.items.find((item) => item.id === current?.parentId);
    }

    return path;
  },
  renameItem: (id, name) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error("Name cannot be empty");
    }
    const state = get();
    const item = state.items.find((entry) => entry.id === id);
    if (!item) {
      throw new Error("Item does not exist");
    }
    if (item.id === RootID) {
      throw new Error("The Home folder cannot be renamed");
    }
    if (hasDuplicateName(state.items, trimmedName, item.parentId, id)) {
      throw new Error("An item with that name already exists");
    }
    const items = state.items.map((entry) =>
      entry.id === id
        ? {
            ...entry,
            name: trimmedName,
            modifiedAt: Date.now(),
          }
        : entry,
    );
    saveFS(items);
    set({ items });
  },
  updateFileContent: (id, content) => {
    const state = get();
    const item = state.items.find((entry) => entry.id === id);

    if (!item) {
      throw new Error("File does not exist");
    }

    if (item.type !== "file") {
      throw new Error("Cannot update folder content");
    }

    const items = state.items.map((entry) =>
      entry.id === id
        ? {
            ...entry,
            content,
            modifiedAt: Date.now(),
          }
        : entry,
    );

    saveFS(items);
    set({ items });
  },

  moveItem: (id, parentId) => {
    const state = get();
    const item = state.items.find((entry) => entry.id === id);

    if (!item) {
      throw new Error("Item does not exist");
    }

    if (item.id === RootID) {
      throw new Error("The Home folder cannot be moved");
    }

    if (parentId === id) {
      throw new Error("An item cannot be moved into itself");
    }

    if (
      parentId !== null &&
      !state.items.some(
        (entry) => entry.id === parentId && entry.type === "folder",
      )
    ) {
      throw new Error("Destination folder does not exist");
    }

    if (
      item.type === "folder" &&
      parentId !== null &&
      isDescendant(state.items, parentId, item.id)
    ) {
      throw new Error("A folder cannot be moved into one of its descendants");
    }

    if (hasDuplicateName(state.items, item.name, parentId, id)) {
      throw new Error("An item with that name already exists");
    }

    const items = state.items.map((entry) =>
      entry.id === id
        ? {
            ...entry,
            parentId,
            modifiedAt: Date.now(),
          }
        : entry,
    );

    saveFS(items);
    set({ items });
  },
  moveToTrash: (id) => {
    const state = get();
    const item = state.items.find((entry) => entry.id === id);

    if (!item) {
      throw new Error("Item does not exist");
    }

    if (item.id === RootID || item.id === TrashID) {
      throw new Error("This item cannot be moved to Trash");
    }

    if (item.parentId === TrashID) {
      return;
    }

    const now = Date.now();

    const items = state.items.map((entry) =>
      entry.id === id
        ? {
            ...entry,
            parentId: TrashID,
            trashedFrom: entry.parentId,
            modifiedAt: now,
          }
        : entry,
    );

    saveFS(items);
    set({ items });
  },
  restoreItem: (id) => {
    const state = get();
    const item = state.items.find((entry) => entry.id === id);
    if (!item) {
      throw new Error("Item does not exist");
    }
    if (item.parentId !== TrashID) {
      throw new Error("Only items in Trash can be restored");
    }

    const originalParentId = item.trashedFrom;
    const originalParentExists =
      originalParentId !== null &&
      originalParentId !== undefined &&
      state.items.some(
        (entry) =>
          entry.id === originalParentId &&
          entry.type === "folder" &&
          entry.id !== TrashID,
      );

    const parentId = originalParentExists ? originalParentId : RootID;
    const now = Date.now();
    const items = state.items.map((entry) =>
      entry.id === id
        ? {
            ...entry,
            parentId,
            trashedFrom: undefined,
            modifiedAt: now,
          }
        : entry,
    );

    saveFS(items);
    set({ items });
  },
  permanentlyDeleteItem: (id) => {
    const state = get();
    const item = state.items.find((entry) => entry.id === id);
    if (!item) {
      throw new Error("Item does not exist");
    }
    if (item.id === RootID || item.id === TrashID) {
      throw new Error("This item cannot be deleted");
    }
    const idsToDelete = new Set([id]);
    const collectDescendants = (parentId: string) => {
      for (const child of state.items.filter(
        (entry) => entry.parentId === parentId,
      )) {
        idsToDelete.add(child.id);
        if (child.type === "folder") collectDescendants(child.id);
      }
    };

    if (item.type === "folder") collectDescendants(item.id);
    const items = state.items.filter((entry) => !idsToDelete.has(entry.id));
    saveFS(items);
    set({ items });
  },
  emptyTrash: () => {
    const state = get();
    const trashIds = new Set<string>();
    const collectTrash = (parentId: string) => {
      for (const item of state.items.filter(
        (entry) => entry.parentId === parentId,
      )) {
        trashIds.add(item.id);
        if (item.type === "folder") collectTrash(item.id);
      }
    };
    collectTrash(TrashID);
    const items = state.items.filter((item) => !trashIds.has(item.id));
    saveFS(items);
    set({ items });
  },
  // deleteItem: (id) => {
  //   const state = get();
  //   const item = state.items.find((entry) => entry.id === id);
  //   if (!item) {throw new Error("Item does not exist")}
  //   if (item.id === RootID) {throw new Error("The Home folder cannot be deleted")}
  //   const idsToDelete = [id];
  //   if (item.type === "folder") {idsToDelete.push(...getDescendantIds(state.items, id))}
  //   const items = state.items.filter((entry) => !idsToDelete.includes(entry.id));
  //   saveFS(items);
  //   set({ items });
  // },
  resetFileSystem: () => {
    const items = createInitFS();
    saveFS(items);
    set({ items });
  },
}));
