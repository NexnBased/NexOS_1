import { create } from "zustand";
import type { FSItem } from "../types/filesystem";

const StorageKey = "nexos.fs";
const RootID = "root";

interface FileSystemStore {
  items: FSItem[];
  createFolder: (name: string, parentId: string | null) => string;
  createFile: (
    name: string,
    parentId: string | null,
    content?: string,
    mimeType?: string,
  ) => string;
  getItem: (id: string) => FSItem | undefined;
  getChildren: (parentId: string | null) => FSItem[];
  renameItem: (id: string, name: string) => void;
  updateFileContent: (id: string, content: string) => void;
  moveItem: (id: string, parentId: string | null) => void;
  deleteItem: (id: string) => void;
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
  ];
};

const loadFS = (): FSItem[] => {
  try {
    const stored = localStorage.getItem(StorageKey);
    if (!stored) {
      return createInitFS();
    }
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return createInitFS();
    }

    return parsed as FSItem[];
  } catch {
    return createInitFS();
  }
};

const saveFS = (items: FSItem[]) => {
  try {
    localStorage.setItem(StorageKey, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save NexOS FS:", error);
  }
};

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

const getDescendantIds = (items: FSItem[], parentId: string): string[] => {
  const children = items.filter((item) => item.parentId === parentId);
  const ids: string[] = [];

  for (const child of children) {
    ids.push(child.id);
    if (child.type === "folder") {
      ids.push(...getDescendantIds(items, child.id));
    }
  }

  return ids;
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

  deleteItem: (id) => {
    const state = get();
    const item = state.items.find((entry) => entry.id === id);

    if (!item) {
      throw new Error("Item does not exist");
    }

    if (item.id === RootID) {
      throw new Error("The Home folder cannot be deleted");
    }

    const idsToDelete = [id];
    if (item.type === "folder") {
      idsToDelete.push(...getDescendantIds(state.items, id));
    }

    const items = state.items.filter(
      (entry) => !idsToDelete.includes(entry.id),
    );
    saveFS(items);
    set({ items });
  },

  resetFileSystem: () => {
    const items = createInitFS();
    saveFS(items);
    set({ items });
  },
}));
