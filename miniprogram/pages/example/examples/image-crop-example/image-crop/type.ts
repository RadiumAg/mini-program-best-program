/** @format */
type Crop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ActiveController = WechatMiniprogram.Component.TrivialInstance | null;

export type {Crop, ActiveController};
