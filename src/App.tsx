import "./App.css";
import Topbar from "./components/Topbar";
import Desktop from "./components/core/Desktop";

function App() {
  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden">
      <Topbar />

      <section className="min-h-0 flex-1">
        <Desktop />
      </section>
    </main>
  );
}

export default App;