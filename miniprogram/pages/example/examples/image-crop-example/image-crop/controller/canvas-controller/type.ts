/** @format */

type CanvasController = {
  cut: () => Promise<string>;
  setCanvasSize: (width: number, height: number) => void;
};

export type {CanvasController};
