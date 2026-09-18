export type FSItemType = "file" | "folder";

export interface FSItem {
  id: string;
  name: string;
  type: FSItemType;
  parentId: string | null;
  content?: string;
  mimeType?: string;
  createdAt: number;
  modifiedAt: number;
}
