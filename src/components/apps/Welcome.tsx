import { XIcon } from "lucide-react";

function Welcome() {
  return (
    <div className="size-full flex flex-col items-left">
      <p className="text-3xl mt-5 ml-3 text-purple-50 tracking-wider">
        Welcome to <strong>NexOS</strong>.<br />
        An OS in the Web. <br />
        Easy to use. <br />
        Everything is stored Locally.
      </p>
      <div className="w-full mt-5 flex flex-row gap-4 items-center justify-center">
        <a
          href="https://github.com/NexnBased/NexOS_1"
          target="_blank"
          rel="noreferrer"
          className="size-fit p-1 pl-2 pr-2 rounded-md font-semibold tracking-wider transition-all text-black hover:text-white bg-violet-600 hover:bg-violet-900"
        >
          Repository
        </a>
        <a
          href="https://github.com/NexnBased"
          target="_blank"
          rel="noreferrer"
          className="size-fit p-1 pl-2 pr-2 rounded-md font-semibold tracking-wider transition-all text-black hover:text-white bg-teal-600 hover:bg-teal-900"
        >
          Developer
        </a>
        <button className="size-fit p-1 -ml-2 rounded-md font-semibold tracking-wider transition-all text-white bg-red-600 hover:bg-white/30">
          <XIcon />
        </button>
      </div>
    </div>
  );
}

export default Welcome;
