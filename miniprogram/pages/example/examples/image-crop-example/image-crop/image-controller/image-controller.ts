/** @format */

import {props} from "./props";
import {getPxToRpx} from "../utils/page";
import type {Container} from "../type";

Component({
  data: {
    position: {
      x: 0,
      y: 0,
    },
    size: {
      width: 0,
      height: 0,
    },
    style: "",
    _style: {},
    _pxToRpx: 0,
  },

  observers: {
    "size.**"(size: typeof this.data.size) {
      this.setData({
        ["_style.width"]: `${size.width}rpx`,
        ["_style.height"]: `${size.height}rpx`,
      });
    },
    "position.**"(position: typeof this.data.position) {
      this.setData({
        ["_style.top"]: `${position.y}rpx`,
        ["_style.left"]: `${position.x}rpx`,
      });
    },
    "src,container"(newValue, oldValue) {
      if (newValue !== oldValue) {
        this._setImageSize();
      }
    },
    "_style.**"() {
      console.log(this.data._style);
      this.setData({
        style: Object.entries(this.data._style)
          .map((_) => _.join(":"))
          .join(";"),
      });
    },
  },

  properties: props,

  methods: {
    async _setImageSize() {
      let {width: imageWidth, height: imageHeight} = await wx.getImageInfo({
        src: this.properties.src,
      });

      const {width: containerWidth, height: containerHeight} = this.data
        .container as Container;

      if (!containerWidth || !containerHeight) return;

      const imageProportion = imageWidth / imageHeight;
      const containerProportion = containerWidth / containerHeight;

      if (imageProportion >= containerProportion) {
        imageWidth = containerWidth;
        imageHeight = imageWidth / imageProportion;
      } else {
        imageHeight = containerHeight;
        imageWidth = imageHeight * imageProportion;
      }

      this.setData({
        size: {
          width: imageWidth,
          height: imageHeight,
        },
      });
    },

    async setPosition() {
      const {width: containerWidth, height: containerHeight} = this.data
        .container as Container;
      const {width, height} = this.data.size;

      const x = containerWidth / 2 - width / 2;
      const y = containerHeight / 2 - height / 2;

      this.setData({
        "position.y": y,
        "position.x": x,
      });
    },
  },

  lifetimes: {
    async attached() {
      await this._setImageSize();
      this.data._pxToRpx = await getPxToRpx();
    },
  },
});
