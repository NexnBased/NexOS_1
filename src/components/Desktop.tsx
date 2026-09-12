import WindowManager from "./WindowManager";

interface Props {
  viewport: {
    width: number;
    height: number;
  };
}

function Desktop({ viewport }: Props) {
  return (
    <main className="relative h-full w-full overflow-hidden">
      <WindowManager viewport={viewport} />
    </main>
  );
}

export default Desktop;