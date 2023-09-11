/** @format */
type Crop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ActiveController = WechatMiniprogram.Component.TrivialInstance | null;

type Container = {
  top: number;
  left: number;
  width: number;
  right: number;
  height: number;
};

export type {Crop, Container, ActiveController};
