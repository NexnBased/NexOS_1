import { useEffect } from "react";
import "./App.css";
import Desktop from "./components/core/Desktop";
import { useUIStore } from "./stores/UIStore";

function App() {
  const toggleLauncher = useUIStore((state) => state.toggleLauncher);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Meta") {
        event.preventDefault();
        toggleLauncher();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleLauncher]);

  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden">
      <Desktop />
    </main>
  );
}

export default App;
