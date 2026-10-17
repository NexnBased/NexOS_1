import { useRef, useState, useEffect } from "react";
import {
  PlayIcon,
  PauseIcon,
  SkipForwardIcon,
  SkipBackIcon,
} from "lucide-react";

interface Track {
  id: string;
  trackNumber: number;
  title: string;
  artist: string;
  duration: number;
  coverUrl: string;
  audioUrl: string;
}

const PLAYLIST: Track[] = [
  {
    id: "1",
    trackNumber: 1,
    title: "SoundHelix Song 1",
    artist: "T. Schürger",
    duration: 372,
    coverUrl:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "2",
    trackNumber: 2,
    title: "SoundHelix Song 2",
    artist: "T. Schürger",
    duration: 423,
    coverUrl:
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "3",
    trackNumber: 3,
    title: "SoundHelix Song 3",
    artist: "T. Schürger",
    duration: 344,
    coverUrl:
      "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    id: "4",
    trackNumber: 4,
    title: "SoundHelix Song 4",
    artist: "T. Schürger",
    duration: 502,
    coverUrl:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
  {
    id: "5",
    trackNumber: 5,
    title: "SoundHelix Song 8",
    artist: "T. Schürger",
    duration: 450,
    coverUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  },
  {
    id: "6",
    trackNumber: 6,
    title: "Toccata and Fugue in D minor",
    artist: "J.S. Bach",
    duration: 520,
    coverUrl:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
    audioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/1/18/Toccata_and_Fugue_in_D_minor.ogg",
  },
  {
    id: "7",
    trackNumber: 7,
    title: "Moonlight Sonata",
    artist: "Ludwig van Beethoven",
    duration: 315,
    coverUrl:
      "https://images.unsplash.com/photo-1513829596324-4bb2800c5efb?w=400&auto=format&fit=crop&q=80",
    audioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/eb/Beethoven_Moonlight_sonata_first_movement.ogg",
  },
  {
    id: "8",
    trackNumber: 8,
    title: "SoundHelix Song 9",
    artist: "T. Schürger",
    duration: 388,
    coverUrl:
      "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
  },
  {
    id: "9",
    trackNumber: 9,
    title: "SoundHelix Song 10",
    artist: "T. Schürger",
    duration: 512,
    coverUrl:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
  },
  {
    id: "10",
    trackNumber: 10,
    title: "SoundHelix Song 16",
    artist: "T. Schürger",
    duration: 410,
    coverUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
  },
];

export default function MusicPlayer() {
  const [playlist] = useState<Track[]>(PLAYLIST);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [hasError, setHasError] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = playlist[currentTrackIndex] || playlist[0];
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasError(false);
        })
        .catch(() => {
          setHasError(true);
          setIsPlaying(false);
        });
    }
  };

  const handleNext = () => {
    setCurrentTrackIndex((state) => (state + 1) % playlist.length);
    setIsPlaying(true);
    setHasError(false);
  };

  const handlePrev = () => {
    if (currentTime > 4) {
      if (audioRef.current) audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    setCurrentTrackIndex(
      (state) => (state - 1 + playlist.length) % playlist.length,
    );
    setIsPlaying(true);
    setHasError(false);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || currentTrack.duration);
      setHasError(false);
    }
  };

  const handleEnded = () => {
    if (currentTrackIndex < playlist.length - 1) handleNext();
    else setIsPlaying(false);
  };

  const handleAudioError = () => {
    setHasError(true);
    setIsPlaying(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) audioRef.current.currentTime = targetTime;
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current
          .play()
          .then(() => setHasError(false))
          .catch(() => {
            setIsPlaying(false);
            setHasError(true);
          });
      }
    }
  }, [currentTrackIndex, currentTrack.audioUrl, isPlaying]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="w-200 h-125 bg-transparent flex flex-row overflow-hidden select-none antialiased">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={handleAudioError}
        preload="metadata"
      />

      <aside className="w-70 h-125 flex flex-col p-3 shrink-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
          {playlist.map((track, idx) => {
            const isCurrent = currentTrackIndex === idx;
            return (
              <div
                key={track.id}
                onClick={() => {
                  setCurrentTrackIndex(idx);
                  setIsPlaying(true);
                }}
                className={`group flex items-center justify-between px-2.5 py-2 rounded-2xl cursor-pointer transition-colors duration-150 ${
                  isCurrent
                    ? "bg-purple-800/30 text-zinc-100"
                    : "hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="w-3.5 flex items-center justify-center shrink-0">
                    {isCurrent && isPlaying ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                    ) : isCurrent ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-100" />
                    ) : (
                      <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400">
                        {track.trackNumber}
                      </span>
                    )}
                  </div>

                  <div className="w-7 h-7 bg-zinc-800 rounded-md shrink-0 overflow-hidden">
                    <img
                      src={track.coverUrl}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`text-xs font-medium truncate leading-tight ${isCurrent ? "text-zinc font-semibold" : "text-zinc-200"}`}
                    >
                      {track.title}
                    </p>
                    <p className="text-[10px] text-zinc-600 truncate leading-tight mt-0.5">
                      {track.artist}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] text-zinc-600 group-hover:text-zinc-400 shrink-0">
                  {formatTime(track.duration)}
                </span>
              </div>
            );
          })}
        </div>
      </aside>

      <main className="w-130 h-125 flex flex-col justify-center items-center p-6 relative overflow-hidden shrink-0">
        <div className="flex flex-col items-center justify-center space-y-4 w-70">
          <div className="relative w-44 h-44 overflow-hidden shrink-0">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover rounded-md transition-opacity duration-300"
            />
          </div>

          {hasError && (
            <div className="text-[10px] text-rose-400 bg-rose-950/40 rounded-full px-2.5 py-1">
              Audio stream unavailable
            </div>
          )}

          <div className="text-center space-y-0.2 w-full">
            <h1 className="text-lg font-bold tracking-wide text-zinc-50 truncate px-2">
              {currentTrack.title}
            </h1>
            <p className="text-xs text-zinc-800 truncate">
              {currentTrack.artist}
            </p>
          </div>

          <div className="w-full space-y-3 pt-2">
            <div className="space-y-1">
              <input
                type="range"
                min={0}
                max={duration || currentTrack.duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-zinc-100 hover:bg-zinc-600 transition-all"
              />
              <div className="flex justify-between text-[10px] text-zinc-600">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration || currentTrack.duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 px-2">
              <button
                onClick={handlePrev}
                className="p-1.5 text-zinc-900 hover:text-zinc-500 transition-colors active:scale-95"
              >
                <SkipBackIcon className="size-4" />
              </button>

              <button
                onClick={togglePlay}
                className="p-3 bg-zinc-200 text-zinc-950 hover:bg-zinc-300 rounded-full transition-all active:scale-95"
              >
                {isPlaying ? (
                  <PauseIcon className="size-4 fill-current" />
                ) : (
                  <PlayIcon className="size-4 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={handleNext}
                className="p-1.5 text-zinc-900 hover:text-zinc-500 transition-colors active:scale-95"
              >
                <SkipForwardIcon className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
