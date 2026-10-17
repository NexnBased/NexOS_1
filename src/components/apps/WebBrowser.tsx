import { useState, type ChangeEvent, type FormEvent } from "react";
import { RotateCwIcon, HomeIcon, SearchIcon, XIcon } from "lucide-react";

export default function WebBrowser() {
  const DEFAULT_URL = "https://en.wikipedia.org/";
  const [currentUrl, setCurrentUrl] = useState(DEFAULT_URL);
  const [inputUrl, setInputUrl] = useState(DEFAULT_URL);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = (target: string): void => {
    const finalTarget = target.trim();
    if (!finalTarget) return;

    let resolvedUrl = finalTarget;
    if (
      !resolvedUrl.startsWith("http://") &&
      !resolvedUrl.startsWith("https://")
    ) {
      if (resolvedUrl.includes(".") && !resolvedUrl.includes(" "))
        resolvedUrl = "https://" + resolvedUrl;
      else
        resolvedUrl = `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(resolvedUrl)}`;
    }

    setCurrentUrl(resolvedUrl);
    setInputUrl(resolvedUrl);
    setIsLoading(true);
  };

  const refresh = (): void => {
    setIsLoading(true);
    const tempUrl = currentUrl;
    setCurrentUrl("");
    setTimeout(() => setCurrentUrl(tempUrl), 50);
  };

  const goHome = (): void => navigate(DEFAULT_URL);

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    navigate(inputUrl);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void =>
    setInputUrl(e.target.value);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="px-3 py-2 flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={goHome}
            className="p-1.5 rounded-md text-purple-950 hover:text-purple-800 hover:bg-purple-400 transition-colors focus:outline-none"
            title="Home"
            type="button"
          >
            <HomeIcon className="size-4" />
          </button>
          <button
            onClick={refresh}
            className="p-1.5 rounded-md text-purple-950 hover:text-purple-800 hover:bg-purple-400 transition-colors focus:outline-none"
            title="Refresh"
            type="button"
          >
            {isLoading ? (
              <XIcon className="size-4" />
            ) : (
              <RotateCwIcon className="size-4" />
            )}
          </button>
        </div>

        <form
          onSubmit={handleFormSubmit}
          className="flex-1 flex items-center bg-zinc-950/80 rounded-md px-3 py-1.5"
        >
          <SearchIcon className="size-3.5 text-zinc-500 mr-2 shrink-0" />
          <input
            type="text"
            value={inputUrl}
            onChange={handleInputChange}
            placeholder="Search anything!"
            className="bg-transparent text-xs text-zinc-200 focus:outline-none w-full placeholder:text-zinc-600 tracking-tight"
          />
          <button
            type="submit"
            className="ml-2 text-[10px] uppercase tracking-wider font-semibold text-zinc-400 hover:text-zinc-100  transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      <div className="flex-1 relative overflow-hidden p-1.5">
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 rounded-md bg-purple-200 animate-pulse z-20" />
        )}
        {currentUrl && (
          <iframe
            src={currentUrl}
            title="Browser Viewport"
            sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
            className="w-full h-full rounded-md"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        )}
      </div>
    </div>
  );
}
