/** @format */

type Position =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "image-controller";

type MoveEvent = {
  x: number;
  y: number;
  height: number;
  width: number;
};

type ControllerTouchStart = {
  type: Position;
};

type Controller = {
  type: Position;
  update: () => Promise<void>;
  getPosition: () => {x: number; y: number};
  getSize: () => {width: number; height: number};
  touchMove: (event: WechatMiniprogram.TouchEvent) => void;
};

export type {Position, MoveEvent, Controller, ControllerTouchStart};
