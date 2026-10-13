import { beforeEach, describe, expect, it } from "vitest";
import { useFileSystemStore } from "./FileSystemStore";
import { RootID, TrashID } from "../types/filesystem";

describe("FileSystemStore", () => {
  beforeEach(() => {
    useFileSystemStore.getState().resetFileSystem();
  });

  it("creates folders and files and retrieves them", () => {
    const state = useFileSystemStore.getState();
    const folderId = state.createFolder("test-folder", RootID);
    expect(folderId).toBeTruthy();
    const fileId = state.createFile("hello.txt", folderId, "hello world", "text/plain");
    expect(fileId).toBeTruthy();
    const file = state.getItem(fileId);
    expect(file).toBeDefined();
    expect(file?.name).toBe("hello.txt");
    expect(file?.parentId).toBe(folderId);
    expect(file?.content).toBe("hello world");
  });

  it("renames, moves, and deletes items", () => {
    const state = useFileSystemStore.getState();
    const f1 = state.createFolder("a", RootID);
    const f2 = state.createFolder("b", RootID);
    const fileId = state.createFile("note.txt", f1, "x", "text/plain");
    state.renameItem(fileId, "note-2.txt");
    const renamed = state.getItem(fileId);
    expect(renamed?.name).toBe("note-2.txt");
    state.moveItem(fileId, f2);
    const moved = state.getItem(fileId);
    expect(moved?.parentId).toBe(f2);
    state.moveToTrash(fileId);
    const trashed = state.getItem(fileId);
    expect(trashed?.parentId).toBe(TrashID);
    state.restoreItem(fileId);
    const restored = state.getItem(fileId);
    expect(restored?.parentId).not.toBe(TrashID);
    state.permanentlyDeleteItem(fileId);
    const deleted = state.getItem(fileId);
    expect(deleted).toBeUndefined();
  });

  it("prevents invalid operations", () => {
    const state = useFileSystemStore.getState();
    expect(() => state.renameItem(RootID, "x")).toThrow();
    expect(() => state.moveItem(RootID, null)).toThrow();
    const f = state.createFolder("dup", RootID);
    state.createFile("file.txt", f, "", "text/plain");
    expect(() => state.createFile("file.txt", f, "", "text/plain")).toThrow();
  });
});