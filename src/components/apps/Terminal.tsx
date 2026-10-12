import { useRef, useMemo, useState, useEffect, type FormEvent } from "react";
import { useWindowStore, useFileSystemStore } from "../../stores";
import { type FSItem, RootID, TrashID } from "../../types/filesystem";

interface TerminalLine {
  id: number;
  text: string;
  kind: "input" | "output" | "error";
}

const tokenize = (input: string) => {
  return (
    input.match(/"[^"]*"|'[^']*'|\S+/g)?.map((token) => {
      if (
        (token.startsWith('"') && token.endsWith('"')) ||
        (token.startsWith("'") && token.endsWith("'"))
      ) {
        return token.slice(1, -1);
      }

      return token;
    }) ?? []
  );
};

function Terminal() {
  const items = useFileSystemStore((state) => state.items);
  const createFolder = useFileSystemStore((state) => state.createFolder);
  const createFile = useFileSystemStore((state) => state.createFile);
  const moveToTrash = useFileSystemStore((state) => state.moveToTrash);
  const moveItem = useFileSystemStore((state) => state.moveItem);
  const getPath = useFileSystemStore((state) => state.getPath);
  const openWindow = useWindowStore((state) => state.openWindow);
  const closeWindow = useWindowStore((state) => state.closeWindow);

  const [currentDirectoryId, setCurrentDirectoryId] = useState(RootID);
  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 0,
      text: 'NexOS Terminal. Type "help" for available commands.',
      kind: "output",
    },
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const nextLineId = useRef(1);
  const currentDirectory = useMemo(
    () =>
      items.find(
        (item) => item.id === currentDirectoryId && item.type === "folder",
      ) ?? items.find((item) => item.id === RootID),
    [items, currentDirectoryId],
  );

  const currentPath = useMemo(() => {
    if (!currentDirectory) return "/";
    const path = getPath(currentDirectory.id);
    if (path.length <= 1) return "/";

    return `/${path
      .slice(1)
      .map((item) => item.name)
      .join("/")}`;
  }, [currentDirectory, getPath]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    const output = outputRef.current;
    if (!output) return;

    output.scrollTo({
      top: output.scrollHeight,
      behavior: "smooth",
    });
  }, [lines]);

  const addLines = (newLines: Array<Pick<TerminalLine, "text" | "kind">>) => {
    setLines((previous) => [
      ...previous,
      ...newLines.map((line) => ({
        ...line,
        id: nextLineId.current++,
      })),
    ]);
  };

  const findChild = (parentId: string, name: string): FSItem | undefined => {
    return items.find(
      (item) =>
        item.parentId === parentId &&
        item.name.toLowerCase() === name.toLowerCase(),
    );
  };

  const resolveDirectory = (
    path: string,
    baseId = currentDirectoryId,
  ): FSItem | undefined => {
    if (!path) return items.find((item) => item.id === baseId);
    let directoryId = path.startsWith("/") ? RootID : baseId;
    const segments = path.split("/").filter(Boolean);

    for (const segment of segments) {
      if (segment === ".") continue;
      if (segment === "..") {
        const current = items.find((item) => item.id === directoryId);

        directoryId = current?.parentId ?? RootID;
        continue;
      }

      if (segment === "~") {
        directoryId = RootID;
        continue;
      }

      const child = findChild(directoryId, segment);
      if (!child || child.type !== "folder") return undefined;

      directoryId = child.id;
    }

    return items.find(
      (item) => item.id === directoryId && item.type === "folder",
    );
  };

  const resolveItem = (path: string): FSItem | undefined => {
    if (path === "/" || path === "~")
      return items.find((item) => item.id === RootID);
    const segments = path.split("/");
    const itemName = segments.pop();
    if (!itemName) return undefined;
    const parentPath = segments.join("/") || ".";
    const parent = resolveDirectory(parentPath);
    if (!parent) return undefined;
    return findChild(parent.id, itemName);
  };

  const formatItem = (item: FSItem) => {
    return item.type === "folder" ? `${item.name}/` : item.name;
  };

  const executeCommand = (rawCommand: string) => {
    const trimmedCommand = rawCommand.trim();
    if (!trimmedCommand) return;

    addLines([
      {
        text: `${currentPath} $ ${trimmedCommand}`,
        kind: "input",
      },
    ]);

    const tokens = tokenize(trimmedCommand);
    const commandName = tokens[0]?.toLowerCase();
    const args = tokens.slice(1);

    try {
      switch (commandName) {
        case "help": {
          addLines([
            {
              kind: "output",
              text: "Available commands:",
            },
            {
              kind: "output",
              text: "  help                 Show this help message",
            },
            {
              kind: "output",
              text: "  pwd                  Show the current directory",
            },
            {
              kind: "output",
              text: "  ls [path]            List directory contents",
            },
            {
              kind: "output",
              text: "  cd <path>            Change directory",
            },
            {
              kind: "output",
              text: "  cat <file>           Read a text file",
            },
            {
              kind: "output",
              text: "  mkdir <name>         Create a folder",
            },
            {
              kind: "output",
              text: "  touch <name>         Create an empty text file",
            },
            {
              kind: "output",
              text: "  rm <path>            Move an item to Trash",
            },
            {
              kind: "output",
              text: "  open <path>          Open a file in its associated app",
            },
            {
              kind: "output",
              text: "  clear                Clear the terminal",
            },
            {
              kind: "output",
              text: "  echo <text>          Print text",
            },
            {
              kind: "output",
              text: "  exit, quit           Close the terminal",
            },
          ]);
          break;
        }

        case "pwd": {
          addLines([
            {
              text: currentPath,
              kind: "output",
            },
          ]);
          break;
        }

        case "ls": {
          const target = args[0] ? resolveDirectory(args[0]) : currentDirectory;

          if (!target) throw new Error("Directory not found");

          const children = items
            .filter((item) => item.parentId === target.id)
            .sort((a, b) => {
              if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
              return a.name.localeCompare(b.name);
            });

          addLines([
            {
              text:
                children.length > 0
                  ? children.map(formatItem).join("    ")
                  : "(empty)",
              kind: "output",
            },
          ]);
          break;
        }

        case "cd": {
          const targetPath = args[0] ?? "~";
          const target = resolveDirectory(targetPath);
          if (!target) throw new Error(`cd: no such directory: ${targetPath}`);
          setCurrentDirectoryId(target.id);
          break;
        }

        case "cat": {
          const target = args[0] ? resolveItem(args[0]) : undefined;
          if (!target || target.type !== "file")
            throw new Error(`cat: file not found: ${args[0] ?? ""}`);

          addLines([
            {
              text: target.content ?? "",
              kind: "output",
            },
          ]);
          break;
        }

        case "mkdir": {
          const name = args[0];
          if (!name) throw new Error("mkdir: missing folder name");
          createFolder(name, currentDirectoryId);

          addLines([
            {
              text: `Created folder: ${name}`,
              kind: "output",
            },
          ]);
          break;
        }

        case "touch": {
          const name = args[0];
          if (!name) throw new Error("touch: missing file name");

          createFile(name, currentDirectoryId, "", "text/plain");

          addLines([
            {
              text: `Created file: ${name}`,
              kind: "output",
            },
          ]);
          break;
        }

        case "rm": {
          const target = args[0] ? resolveItem(args[0]) : undefined;
          if (!target) throw new Error(`rm: item not found: ${args[0] ?? ""}`);
          if (target.id === RootID || target.id === TrashID)
            throw new Error("rm: protected filesystem item");

          moveToTrash(target.id);
          addLines([
            {
              text: `Moved to Trash: ${target.name}`,
              kind: "output",
            },
          ]);
          break;
        }

        case "open": {
          const target = args[0] ? resolveItem(args[0]) : undefined;
          if (!target)
            throw new Error(`open: item not found: ${args[0] ?? ""}`);
          if (target.type === "folder") {
            openWindow("files");
            break;
          }

          if (
            target.mimeType?.startsWith("text/") ||
            target.mimeType === "application/json"
          ) {
            openWindow("texteditor", {
              fileId: target.id,
            });
            break;
          }

          throw new Error("open: no associated application");
        }

        case "echo": {
          addLines([
            {
              text: args.join(" "),
              kind: "output",
            },
          ]);
          break;
        }

        case "clear": {
          setLines([]);
          break;
        }

        case "mv": {
          if (args.length < 2)
            throw new Error("mv: usage: mv <source> <directory>");
          const source = resolveItem(args[0]);
          const destination = resolveDirectory(args[1]);
          if (!source) throw new Error(`mv: item not found: ${args[0]}`);
          if (!destination)
            throw new Error(`mv: directory not found: ${args[1]}`);

          moveItem(source.id, destination.id);
          addLines([
            {
              text: `Moved ${source.name} to ${destination.name}`,
              kind: "output",
            },
          ]);
          break;
        }

        case "exit":
        case "quit": {
          addLines([
            {
              text: "Goodbye!",
              kind: "output",
            },
          ]);

          setTimeout(() => {
            closeWindow("terminal");
          }, 300);
          break;
        }

        default:
          addLines([
            {
              text: `command not found: ${commandName}`,
              kind: "error",
            },
          ]);
      }
    } catch (error) {
      addLines([
        {
          text: error instanceof Error ? error.message : "Command failed",
          kind: "error",
        },
      ]);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedCommand = command.trim();
    if (!trimmedCommand) return;

    setCommandHistory((previous) => [...previous, trimmedCommand]);
    setHistoryIndex(-1);
    executeCommand(trimmedCommand);
    setCommand("");
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIndex =
        historyIndex === -1
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1);

      setHistoryIndex(nextIndex);
      setCommand(commandHistory[nextIndex] ?? "");
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setCommand("");
        return;
      }

      setHistoryIndex(nextIndex);
      setCommand(commandHistory[nextIndex] ?? "");
    }
  };

  return (
    <div
      className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-zinc-950 p-3 font-mono text-xs text-white/80"
      onClick={() => inputRef.current?.focus()}
    >
      <div
        ref={outputRef}
        className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pr-1"
      >
        {lines.map((line) => (
          <div
            key={line.id}
            className={
              line.kind === "error"
                ? "text-red-400"
                : line.kind === "input"
                  ? "text-purple-300"
                  : "text-white/75"
            }
          >
            {line.text}
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-3 flex shrink-0 items-center gap-2 border-t border-white/10 pt-2"
      >
        <span className="shrink-0 text-red-400">{currentPath} $</span>

        <input
          ref={inputRef}
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          onKeyDown={handleInputKeyDown}
          autoComplete="off"
          spellCheck={false}
          aria-label="Terminal command"
          className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/25"
          placeholder="Type here"
        />
      </form>
    </div>
  );
}

export default Terminal;
