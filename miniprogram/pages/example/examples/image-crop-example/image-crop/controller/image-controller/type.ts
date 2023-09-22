/** @format */
type ImageControllerInitEvent = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ImageController = {
  type: string;
  update: () => void;
  touchMove: () => void;
  getPosition: () => {x: number; y: number};
  getSize: () => {width: number; height: number};
  getActualPositionAndSize: () => {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

type AfterSetImageSizeEvent = {
  width: number;
  height: number;
};

export type {ImageControllerInitEvent, ImageController, AfterSetImageSizeEvent};
