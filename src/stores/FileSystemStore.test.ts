import { beforeEach, describe, expect, it } from "vitest";
import { useFileSystemStore } from "./FileSystemStore";

describe("FileSystemStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useFileSystemStore.getState().resetFileSystem();
  });

  it("creates a folder", () => {
    const store = useFileSystemStore.getState();
    const folderId = store.createFolder("Projects", "root");
    const folder = useFileSystemStore.getState().getItem(folderId);

    expect(folder).toMatchObject({
      name: "Projects",
      type: "folder",
      parentId: "root",
    });
  });

  it("creates a file inside a folder", () => {
    const store = useFileSystemStore.getState();
    const folderId = store.createFolder("Test Documents", "root");
    const fileId = store.createFile(
      "readme.txt",
      folderId,
      "Hello NexOS",
      "text/plain",
    );

    const file = useFileSystemStore.getState().getItem(fileId);

    expect(file).toMatchObject({
      name: "readme.txt",
      type: "file",
      parentId: folderId,
      content: "Hello NexOS",
      mimeType: "text/plain",
    });
  });

  it("rejects duplicate names in the same folder", () => {
    const store = useFileSystemStore.getState();
    store.createFolder("Projects", "root");
    expect(() => {
      store.createFolder("projects", "root");
    }).toThrow("An item with that name already exists");
  });

  it("moves items to Trash and restores them", () => {
    const store = useFileSystemStore.getState();

    const folderId = store.createFolder("Test Documents", "root");

    const fileId = store.createFile(
      "note.txt",
      folderId,
      "Hello",
      "text/plain",
    );

    store.moveToTrash(fileId);

    const trashedFile = useFileSystemStore.getState().getItem(fileId);

    expect(trashedFile).toMatchObject({
      parentId: "trash",
      trashedFrom: folderId,
    });

    store.restoreItem(fileId);

    expect(useFileSystemStore.getState().getItem(fileId)).toMatchObject({
      parentId: folderId,
    });
  });
  it("restores a folder with its children", () => {
    const store = useFileSystemStore.getState();
    const folderId = store.createFolder("Project", "root");

    const fileId = store.createFile(
      "main.ts",
      folderId,
      "console.log('hello')",
      "text/typescript",
    );

    store.moveToTrash(folderId);
    store.restoreItem(folderId);

    expect(useFileSystemStore.getState().getItem(folderId)).toMatchObject({
      parentId: "root",
    });
    expect(useFileSystemStore.getState().getItem(fileId)).toMatchObject({
      parentId: folderId,
    });
  });
  it("updates file content and persists it", () => {
    const store = useFileSystemStore.getState();

    const fileId = store.createFile(
      "editor-test.txt",
      "root",
      "before",
      "text/plain",
    );

    store.updateFileContent(fileId, "after");

    expect(useFileSystemStore.getState().getItem(fileId)).toMatchObject({
      content: "after",
    });

    const persisted = JSON.parse(localStorage.getItem("nexos.fs") ?? "{}");

    expect(
      persisted.items.find((item: { id: string }) => item.id === fileId),
    ).toMatchObject({
      content: "after",
    });
  });
  it("restores to root when the original parent no longer exists", () => {
    const store = useFileSystemStore.getState();

    const folderId = store.createFolder("Temporary Folder", "root");

    const fileId = store.createFile(
      "note.txt",
      folderId,
      "content",
      "text/plain",
    );

    store.moveToTrash(fileId);
    store.permanentlyDeleteItem(folderId);
    store.restoreItem(fileId);

    expect(useFileSystemStore.getState().getItem(fileId)).toMatchObject({
      parentId: "root",
    });
  });

  it("empties Trash recursively", () => {
    const store = useFileSystemStore.getState();
    const folderId = store.createFolder("Deleted Folder", "root");
    const fileId = store.createFile(
      "deleted.txt",
      folderId,
      "deleted",
      "text/plain",
    );

    store.moveToTrash(folderId);
    store.emptyTrash();

    expect(useFileSystemStore.getState().getItem(folderId)).toBeUndefined();
    expect(useFileSystemStore.getState().getItem(fileId)).toBeUndefined();
  });

  it("permanently deletes a file", () => {
    const store = useFileSystemStore.getState();
    const fileId = store.createFile(
      "temporary.txt",
      "root",
      "temporary",
      "text/plain",
    );

    store.permanentlyDeleteItem(fileId);
    expect(useFileSystemStore.getState().getItem(fileId)).toBeUndefined();
  });

  it("persists changes to localStorage", () => {
    const store = useFileSystemStore.getState();
    store.createFile("saved.txt", "root", "saved content", "text/plain");

    const saved = JSON.parse(localStorage.getItem("nexos.fs") ?? "{}");
    expect(saved.version).toBe(1);
    expect(
      saved.items.some((item: { name: string }) => item.name === "saved.txt"),
    ).toBe(true);
  });
});
