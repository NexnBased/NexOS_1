export type FSItemType = "file" | "folder";
export type FSMimeType = string;

export const RootID = "root";
export const TrashID = "trash";
export const FSStorageKey = "nexos.fs";

export interface FSItem {
  id: string;
  name: string;
  type: FSItemType;
  parentId: string | null;
  content?: string;
  mimeType?: FSMimeType;
  createdAt: number;
  modifiedAt: number;
  trashedFrom?: string | null;
}
