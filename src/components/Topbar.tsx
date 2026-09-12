import "../styles/Topbar.css";
import dayjs from "dayjs";
import {
  BellIcon,
  MoonIcon,
  PowerIcon,
  RefreshCcwIcon,
  SunIcon,
  Volume2Icon,
  WifiIcon,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar } from "@mantine/dates";

interface LocationData {
  ip: string;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
}

function Topbar() {
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLElement>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const toggleMenu = (menu: string) => {
    setOpenMenu((current) => (current === menu ? null : menu));
  };

  useEffect(() => {
    const controller = new AbortController();

    fetch("https://ipwho.is/", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) throw new Error(data.message || "Error");
        setLocation(data);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      });

    return () => controller.abort();
  }, []);

  return (
    <header
      ref={menuRef}
      className="w-full h-10 p-1 pr-2 pl-2 flex flex-row items-center justify-between border-b border-b-white/25 bg-black/60"
    >
      <section className="relative w-1/3 flex flex-row gap-1 items-center justify-start">
        <button
          type="button"
          onClick={() => toggleMenu("MenuAbout")}
          aria-expanded={openMenu === "MenuAbout"}
          aria-haspopup="menu"
          className={`w-18 h-6 tracking-wider text-purple-400 hover:bg-purple-200/20 ${openMenu === "MenuAbout" ? "bg-purple-200/20" : ""}`}
        >
          NexOS
        </button>
        <AnimatePresence>
          {openMenu === "MenuAbout" && (
            <motion.div
              key="menu-about"
              role="menu"
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="w-50 left-1.5 flex-col items-center"
            >
              <p className="mt-5 text-3xl font-medium text-purple-400 tracking-wider">
                NexOS
              </p>
              <p className="mt-2 text-[15px] font-mono! text-purple-400 tracking-wider">
                Build 1.0.0
              </p>
              <a
                href="https://github.com/NexnBased/NexOS_1"
                rel="noopener noreferrer"
                target="_blank"
                className="w-30 h-fit p-1 mt-7 text-center bg-purple-200/20 rounded-full text-[15px] font-medium text-purple-400 tracking-wider"
                onClick={() => setOpenMenu(null)}
              >
                Source code
              </a>
              <p className="mt-4 mb-4 text-[14px]">
                Developed by{" "}
                <a
                  href="https://github.com/NexnBased"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-purple-400 hover:text-purple-200"
                  onClick={() => setOpenMenu(null)}
                >
                  NexnBased
                </a>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
      <section className="relative w-1/3 flex flex-row gap-1 items-center justify-center">
        <button
          type="button"
          onClick={() => toggleMenu("MenuCalendar")}
          aria-expanded={openMenu === "MenuCalendar"}
          aria-haspopup="menu"
          className={`w-18 h-6 flex items-center justify-center tracking-wider text-purple-400 hover:bg-purple-200/20 ${openMenu === "MenuCalendar" ? "bg-purple-200/20" : ""}`}
        >
          {currentTime.format("MMM D")}
        </button>
        <button
          type="button"
          onClick={() => toggleMenu("MenuClock")}
          aria-expanded={openMenu === "MenuClock"}
          aria-haspopup="menu"
          className={`w-21 h-6 flex items-center justify-center select-none tracking-wider text-purple-400 hover:bg-purple-200/20 ${openMenu === "MenuClock" ? "bg-purple-200/20" : ""}`}
        >
          {currentTime.format("HH:mm A")}
        </button>
        <AnimatePresence>
          {openMenu === "MenuClock" && (
            <motion.div
              key="menu-clock"
              role="menu"
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="w-40 left-2/5 flex-col items-center"
            >
              <p className="mt-5 text-3xl font-medium text-purple-400 tracking-wider">
                {currentTime.format("HH:mm:ss")}
              </p>
              <p className="w-30 h-fit p-1 mt-4 text-center bg-purple-200/20 rounded-full text-[15px] font-medium text-purple-400 tracking-wider">
                {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </p>
              <p className="w-30 h-fit p-1 mt-2 mb-4 text-center bg-purple-200/20 rounded-full text-[15px] font-medium text-purple-400 tracking-wider">
                {navigator.language}
              </p>
            </motion.div>
          )}
          {openMenu === "MenuCalendar" && (
            <motion.div
              key="menu-calendar"
              aria-label="Calendar"
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="p-1 left-1/6"
            >
              <Calendar
                static
                hideOutsideDates
                firstDayOfWeek={0}
                renderDay={(date) => {
                  const day = dayjs(date);
                  const isToday = day.isSame(currentTime, "day");

                  return (
                    <div
                      className={`flex h-full w-full items-center justify-center rounded-md ${isToday ? "bg-purple-400 text-black" : ""}`}
                    >
                      {day.date()}
                    </div>
                  );
                }}
                classNames={{
                  calendarHeader: "bg-purple-400/20 rounded-md",
                  calendarHeaderLevel: "hover:bg-purple-400!",
                  calendarHeaderControl: "hover:bg-purple-400!",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>
      <section className="relative w-1/3 flex flex-row items-center justify-end">
        <button
          type="button"
          onClick={() => toggleMenu("MenuPanel")}
          aria-expanded={openMenu === "MenuPanel"}
          aria-haspopup="menu"
          className={`w-24 h-6 flex gap-3 items-center justify-center select-none tracking-wider text-purple-400 hover:bg-purple-200/20 ${openMenu === "MenuPanel" ? "bg-purple-200/20" : ""}`}
        >
          <WifiIcon size={15} strokeWidth={3} />
          <Volume2Icon size={15} strokeWidth={3} />
          <PowerIcon size={15} strokeWidth={3} />
        </button>
        <AnimatePresence>
          {openMenu === "MenuPanel" && (
            <motion.div
              key="menu-panel"
              role="menu"
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="w-50 p-3 flex-col items-center flex-nowrap"
            >
              <section className="w-full h-fit flex flex-row gap-2 items-center justify-between">
                <button
                  type="button"
                  aria-label="Reboot"
                  onClick={() => window.location.reload()}
                  className="h-14 w-1/2 flex items-center justify-center transition-all bg-purple-200 text-purple-800 hover:bg-yellow-300 hover:text-white active:scale-95"
                >
                  <RefreshCcwIcon size={28} strokeWidth={3} />
                </button>
                <button
                  type="button"
                  aria-label="Sleep"
                  className="h-14 w-1/2 flex items-center justify-center transition-all bg-purple-200 text-purple-800 hover:bg-green-300 hover:text-white active:scale-95"
                >
                  <MoonIcon size={28} strokeWidth={3} />
                </button>
              </section>
              <section className="w-full h-fit mt-3 flex flex-row gap-2 items-center justify-center">
                <p className="size-fit p-1 pl-2 pr-2 rounded-full flex flex-row gap-2 items-center tracking-wide text-white/60 bg-purple-800 pointer-events-none select-none">
                  <Volume2Icon size={18} strokeWidth={3} />
                  <span className="text-[16px] font-bold">100%</span>
                </p>
                <p className="size-fit p-1 pl-2 pr-2 rounded-full flex flex-row gap-2 items-center tracking-wide text-white/60 bg-purple-800 pointer-events-none select-none">
                  <SunIcon size={18} strokeWidth={3} />
                  <span className="text-[16px] font-bold">100%</span>
                </p>
              </section>
              {location?.ip && (
                <section className="w-full h-fit mt-2 flex flex-row gap-2 items-center justify-center">
                  <p className="size-fit p-1 pl-2 pr-2 rounded-full flex flex-row gap-2 items-center font-mono! tracking-wider text-white/80 bg-purple-800 pointer-events-none select-none">
                    {location.ip
                      ? location.ip.includes(":")
                        ? location.ip
                            .split(":")
                            .map((part, i, arr) =>
                              i > 0 && i < arr.length - 1 ? "****" : part,
                            )
                            .join(":")
                        : location.ip
                            .split(".")
                            .map((part, i) =>
                              i === 1 || i === 2 ? "***" : part,
                            )
                            .join(".")
                      : ""}
                  </p>
                </section>
              )}
              <section className="w-full h-fit mt-2 flex flex-row gap-2 items-center justify-center">
                {error ? (
                  <p className="size-fit p-1 pl-2.5 pr-2.5 text-center rounded-full tracking-wide text-white/60 bg-purple-800 pointer-events-none select-none text-wrap">
                    {error}
                  </p>
                ) : (
                  <>
                    <p className="size-fit p-1 pl-2.5 pr-2.5 text-center rounded-full tracking-wide text-white/60 bg-purple-800 pointer-events-none select-none text-wrap">
                      {location?.city}
                    </p>
                    <p className="size-fit p-1 pl-2.5 pr-2.5 text-center rounded-full tracking-wide text-white/60 bg-purple-800 pointer-events-none select-none text-wrap">
                      {location?.country}
                    </p>
                  </>
                )}
              </section>
            </motion.div>
          )}
          {openMenu === "MenuPanel" && (
            <motion.div
              key="menuNotifications"
              role="menu"
              initial={{ opacity: 0, x: 12, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 12, y: -6, scale: 0.97 }}
              style={{ transformOrigin: "top right" }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="w-40 right-2/5 p-3 flex-col items-center flex-nowrap"
            >
              <div className="w-full h-12 flex items-center justify-center rounded-xl text-white bg-purple-800">
                <BellIcon strokeWidth={3} />
              </div>
              <p className="mt-2 text-[14px] text-purple-200/80">
                No Notifications Yet!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </header>
  );
}

export default Topbar;
