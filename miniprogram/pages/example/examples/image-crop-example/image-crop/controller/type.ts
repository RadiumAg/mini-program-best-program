/** @format */
type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right";


type UpdateEvent = {
  xDistance: number;
  yDistance: number;
}

export type { Position, UpdateEvent };
