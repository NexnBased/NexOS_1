import { useMemo, useState } from "react";
import { useFileSystemStore } from "../../stores/FileSystemStore";
import type { AppProps } from "../../app/AppRegistry";

function escapeHtml(input = "") {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function simpleMarkdownToHtml(md = ""): string {
  let html = escapeHtml(md);
  html = html.replace(/```([\s\S]*?)```/g, (_m, code) => {
    return `<pre class="p-2 bg-black/20 rounded"><code>${escapeHtml(code)}</code></pre>`;
  });
  html = html.replace(/^###### (.*$)/gim, "<h6>$1</h6>");
  html = html.replace(/^##### (.*$)/gim, "<h5>$1</h5>");
  html = html.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer">$1</a>',
  );
  html = html.replace(/^\s*[-*] (.*)/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, (m) => `<ul>${m}</ul>`);
  html = html.replace(
    /^(?!<(h|ul|pre|blockquote|h1|h2|h3|h4|h5|h6|li))(.+)$/gm,
    "<p>$2</p>",
  );
  html = html.replace(/<\/ul>\s*<ul>/g, "");

  return html;
}

function MarkdownViewer({ fileId }: AppProps) {
  const file = useFileSystemStore((s) =>
    fileId ? s.getItem(fileId) : undefined,
  );
  const [renderHtml, setRenderHtml] = useState(true);
  const content = file?.content ?? "";
  const html = useMemo(() => simpleMarkdownToHtml(content), [content]);
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
    <div className="flex h-full flex-col overflow-hidden bg-white text-slate-900">
      <header className="flex items-center justify-between px-3 py-2 border-b">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">{file.name}</span>
          <span className="text-xs text-slate-500">
            {file.mimeType ?? "text/markdown"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRenderHtml((v) => !v)}
            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-sm"
          >
            {renderHtml ? "Raw" : "Render"}
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-auto p-4">
        {renderHtml ? (
          <article
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <pre className="whitespace-pre-wrap wra-break-words font-mono text-sm text-slate-800">
            {content}
          </pre>
        )}
      </div>
    </div>
  );
}

export default MarkdownViewer;
