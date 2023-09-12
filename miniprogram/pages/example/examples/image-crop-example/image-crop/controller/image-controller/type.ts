/** @format */
type ImageControllerInitEvent = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ImageController = {
  getPosition: () => {x: number; y: number};
  getSize: () => {width: number; height: number};
};

export type {ImageControllerInitEvent, ImageController};
