import type { AppDefinition } from "../../app/AppRegistry";

interface Props {
  app: AppDefinition;
  selected: boolean;
  onClick: () => void;
}

function AppLauncherItem({ app, selected, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-28 flex-col items-center gap-2 rounded-2xl p-3 transition-all duration-150 ease-out focus:outline-none ${selected ? "bg-white/20 scale-105" : "hover:bg-white/10 hover:scale-105"}`}
    >
      <div
        className={`flex size-16 items-center justify-center rounded-2xl transition-transform duration-150 ${selected ? "scale-110" : ""}`}
      >
        {app.icon ? (
          <img
            src={app.icon}
            alt=""
            draggable={false}
            className="size-full object-contain rounded-md"
          />
        ) : (
          <div className="size-full rounded-2xl bg-white/20" />
        )}
      </div>
      <span className="max-w-full truncate text-sm font-medium text-white drop-shadow">
        {app.title}
      </span>
    </button>
  );
}

export default AppLauncherItem;
