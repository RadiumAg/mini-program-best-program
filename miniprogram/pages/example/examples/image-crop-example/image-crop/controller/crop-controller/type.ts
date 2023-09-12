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

type Controller = {
  type: Position;
  update: () => Promise<void>;
  getPosition: () => {x: number; y: number};
  getSize: () => {width: number; height: number};
  touchMove: (event: WechatMiniprogram.TouchEvent) => void;
};

export type {Position, UpdateEvent, Controller, ControllerTouchStart};
