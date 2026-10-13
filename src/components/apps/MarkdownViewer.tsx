import { useMemo, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { useFileSystemStore } from "../../stores/FileSystemStore";

type AppProps = { width?: number; height?: number; fileId?: string };

function MarkdownViewer({ fileId }: AppProps) {
  const file = useFileSystemStore((s) =>
    fileId ? s.getItem(fileId) : undefined,
  );
  const [renderHtml, setRenderHtml] = useState(true);
  const content = file?.content ?? "";
  const html = useMemo(() => {
    try {
      const raw = marked.parse(content || "");
      if (typeof raw === "string") return DOMPurify.sanitize(raw);
      return `<pre>${DOMPurify.sanitize(String(content))}</pre>`;
    } catch {
      return `<pre>${DOMPurify.sanitize(String(content))}</pre>`;
    }
  }, [content]);

  if (!fileId) {
    return (
      <div className="flex h-full items-center justify-center text-sm">
        Open a markdown file from Files.
      </div>
    );
  }

  if (!file) {
    return (
      <div className="flex h-full items-center justify-center text-sm">
        File not found.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex items-center justify-between px-3 py-2 border-b">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">{file.name}</span>
          <span className="text-xs text-zinc-500">
            {file.mimeType ?? "text/markdown"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRenderHtml((v) => !v)}
            className="px-2 py-1 rounded-md text-white bg-purple-500 hover:bg-purple-400 text-sm"
          >
            {renderHtml ? "Raw" : "Render"}
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-auto p-4">
        {renderHtml ? (
          <article
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <pre className="whitespace-pre-wrap wrap-break-words text-sm text-zinc-800">
            {content}
          </pre>
        )}
      </div>
    </div>
  );
}

export default MarkdownViewer;
