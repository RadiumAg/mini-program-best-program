/** @format */

import {props} from "./props";
import type {CanvasController} from "./type";

Component({
  options: {
    pureDataPattern: /^_/,
  },

  data: {
    size: {
      width: 0,
      height: 0,
    },
    _pxToRpx: 0,
    _pixelRatio: 0,
    _canvas: null as WechatMiniprogram.Canvas | null,
    _context:
      null as WechatMiniprogram.CanvasRenderingContext.CanvasRenderingContext2D | null,
  },

  observers: {},

  properties: props,

  behaviors: ["wx://component-export"],

  methods: {},

  async attached() {
    this.data._pixelRatio = wx.getWindowInfo().pixelRatio;

    this.createSelectorQuery()
      .select("#canvas-controller")
      .fields({node: true, size: true})
      .exec(async (res) => {
        const [{node: canvas}] = res;
        this.data._canvas = canvas;
        this.data._context = canvas.getContext("2d");
      });
  },

  export() {
    return {
      cut: async () => {
        const {imageController, crop, src, _canvas, _pixelRatio, _context} =
          this.data;
        if (
          imageController === null ||
          crop === null ||
          _canvas === null ||
          _context === null
        )
          return;

        const imageControllerSize = imageController.getSize();
        const imageControllerPosition = imageController.getPosition();
        const canvasX = crop.x - imageControllerPosition.x;
        const canvasY = crop.y - imageControllerPosition.y;

        _canvas.width = imageControllerSize.width;
        _canvas.height = imageControllerSize.height;

        await new Promise((resolve) => {
          const image = _canvas.createImage();
          image.width = imageControllerSize.width;
          image.height = imageControllerSize.height;
          image.src = src;

          image.onload = () => {
            _context.drawImage(
              image,
              0,
              0,
              imageControllerSize.width,
              imageControllerSize.height
            );
            resolve("resolve");
          };
        });

        const {tempFilePath} = await wx.canvasToTempFilePath({
          canvas: _canvas,

          x: canvasX / _pixelRatio,
          y: canvasY / _pixelRatio,

          width: crop.width / _pixelRatio,
          height: crop.height / _pixelRatio,
        });

        return tempFilePath;
      },

      setCanvasSize: (width: number, height: number) => {
        this.setData({
          size: {
            width,
            height,
          },
        });
      },
    } as CanvasController;
  },
});
