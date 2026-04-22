export type GamepadAction =
  | "up"
  | "down"
  | "left"
  | "right"
  | "confirm"
  | "back"
  | "start"
  | "select"
  | "lb"
  | "rb";

type Listener = (a: GamepadAction) => void;

const REPEAT_MS = 180;
const DEAD = 0.35;

export function startGamepadLoop(onAction: Listener, onConnectChange: (b: boolean) => void) {
  const lastFire: Record<string, number> = {};
  let lastConnected = false;
  let raf = 0;

  const fire = (a: GamepadAction) => {
    const now = performance.now();
    if (now - (lastFire[a] || 0) < REPEAT_MS) return;
    lastFire[a] = now;
    onAction(a);
  };

  const tick = () => {
    const pads = navigator.getGamepads?.() || [];
    const pad = pads.find((p) => p && p.connected) || null;
    const connected = !!pad;
    if (connected !== lastConnected) {
      lastConnected = connected;
      onConnectChange(connected);
    }
    if (pad) {
      const [lx, ly] = [pad.axes[0] || 0, pad.axes[1] || 0];
      if (ly < -DEAD || pad.buttons[12]?.pressed) fire("up");
      if (ly > DEAD || pad.buttons[13]?.pressed) fire("down");
      if (lx < -DEAD || pad.buttons[14]?.pressed) fire("left");
      if (lx > DEAD || pad.buttons[15]?.pressed) fire("right");
      if (pad.buttons[0]?.pressed) fire("confirm"); // A / X
      if (pad.buttons[1]?.pressed) fire("back");    // B / O
      if (pad.buttons[9]?.pressed) fire("start");
      if (pad.buttons[8]?.pressed) fire("select");
      if (pad.buttons[4]?.pressed) fire("lb");
      if (pad.buttons[5]?.pressed) fire("rb");
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
