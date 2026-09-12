import { useEffect, useState } from "react";
import "./App.css";
import Topbar from "./components/Topbar";
import Desktop from "./components/Desktop";

function App() {
  const wallpaper_url =
    "https://images8.alphacoders.com/136/thumb-1920-1363709.png";
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <main
      className={`w-screen h-screen overflow-hidden flex flex-col bg-cover bg-center bg-no-repeat`}
      style={{ backgroundImage: `url(${wallpaper_url})` }}
    >
      <Topbar />

      <section className="min-h-0 flex-1">
        <Desktop viewport={viewport} />
      </section>
    </main>
  );
}

export default App;