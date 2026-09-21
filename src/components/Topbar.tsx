import dayjs from "dayjs";
import { useRef, useState, useEffect } from "react";
import { PowerIcon, Volume2Icon, WifiIcon } from "lucide-react";

function Topbar() {
  const [currentTime, setCurrentTime] = useState(dayjs());
  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <header
      ref={menuRef}
      className="w-full h-10 p-1 pr-2 pl-2 flex flex-row items-center justify-between border-b border-b-white/25 bg-zinc-900"
    >
      <section className="relative w-1/3 flex flex-row gap-1 items-center justify-start">
        <button
          type="button"
          className="w-18 h-6 font-bold text-sm  tracking-wider text-purple-400 select-none pointer-events-none"
          disabled
        >
          NexOS
        </button>
      </section>
      <section className="relative w-1/3 flex flex-row gap-1 items-center justify-center">
        <button
          disabled
          type="button"
          className="w-18 h-6 font-bold text-sm flex items-center justify-center tracking-wider select-none pointer-events-none text-purple-400"
        >
          {currentTime.format("MMM D")}
        </button>
        <button
          disabled
          type="button"
          className="w-21 h-6 font-bold text-sm flex items-center justify-center tracking-wider select-none pointer-events-none text-purple-400"
        >
          {currentTime.format("HH:mm A")}
        </button>
      </section>
      <section className="relative w-1/3 flex flex-row items-center justify-end">
        <button
          disabled
          type="button"
          className="w-24 h-6 font-bold text-sm flex gap-3 items-center justify-center pointer-events-none select-none tracking-wider text-purple-400"
        >
          <WifiIcon size={15} strokeWidth={3} />
          <Volume2Icon size={15} strokeWidth={3} />
          <PowerIcon size={15} strokeWidth={3} />
        </button>
      </section>
    </header>
  );
}

export default Topbar;
