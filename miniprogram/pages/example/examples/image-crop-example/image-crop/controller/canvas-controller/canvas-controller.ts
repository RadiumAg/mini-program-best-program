/** @format */

import {getPxToRpx} from "../../utils/page";
import {props} from "./props";

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
    console.log(this.data._imageInfo);

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
      export: () => {
        const {imageController, crop, _imageInfo, _canvas, _context} =
          this.data;
        if (_canvas === null || crop === null || _context === null) return;

        const imageControllerSize = imageController.getSize();
        const imageControllerPosition = imageController.getPosition();
        const canvasX = crop.x - imageControllerPosition.x;
        const canvasY = crop.y - imageControllerPosition.y;

        _canvas.width = imageControllerSize.width;
        _canvas.height = imageControllerSize.height;

        _context.getImageData(canvasX, canvasY, crop.width, crop.height);
        wx.canvasToTempFilePath({canvas: _canvas, width: _canvas.width});
      },
    };
  },
});
