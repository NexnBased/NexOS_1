interface Props {
  width: number;
  height: number;
}

function Welcome({ width, height }: Props) {
  return (
    <div
      className=""
      style={{
        width,
        height,
      }}
    >
      <p className="text-3xl text-purple-400 tracking-wider">
        Welcome to <strong>NexOS</strong>.<br />
        An OS in the Web.
      </p>
    </div>
  );
}

export default Welcome;
