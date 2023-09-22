/** @format */

import {getPxToRpx} from "../../utils/page";
import {props} from "./props";
import type {CanvasController} from "./type";

Component({
  options: {
    pureDataPattern: /^_/,
  },

  data: {
    _pxToRpx: 0,
    _canvas: null as WechatMiniprogram.Canvas | null,
    _imageInfo:
      null as WechatMiniprogram.GetImageInfoSuccessCallbackResult | null,
    _context:
      null as WechatMiniprogram.CanvasRenderingContext.CanvasRenderingContext2D | null,
  },

  properties: props,

  behaviors: ["wx://component-export"],

  methods: {},

  async attached() {
    const {src} = this.data;
    this.data._pxToRpx = await getPxToRpx();
    this.data._imageInfo = await wx.getImageInfo({src});

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
        const {imageController, crop, _imageInfo, _canvas, _context} =
          this.data;

        console.log(imageController, crop, _canvas, _context, _imageInfo);
        if (
          crop === null ||
          _canvas === null ||
          _context === null ||
          _imageInfo === null
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
          image.src = _imageInfo.path;
          image.onload = () => {
            _context.drawImage(image, 0, 0);
            resolve("resolve");
          };
        });

        const {tempFilePath} = await wx.canvasToTempFilePath({
          x: canvasX,
          y: canvasY,
          canvas: _canvas,
          width: _canvas.width,
          height: _canvas.height,
        });

        console.log(tempFilePath);
        return tempFilePath;
      },
    } as CanvasController;
  },
});
