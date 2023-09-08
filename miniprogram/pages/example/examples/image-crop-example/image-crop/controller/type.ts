/** @format */

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right";

type UpdateEvent = {
  x: number;
  y: number;
  height: number;
  width: number;
};

type ControllerTouchStart = {
  type: Position;
};

export type {Position, UpdateEvent, ControllerTouchStart};
