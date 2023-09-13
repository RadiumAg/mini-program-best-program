/** @format */

import {props} from "./props";
import {getPxToRpx} from "../../utils/page";
import type {Container} from "../../type";
import type {ImageController, ImageControllerInitEvent} from "./type";
import type {Crop} from "../../crop/type";

Component({
  options: {
    pureDataPattern: /^_/,
  },

  properties: props,

  data: {
    position: {
      x: 0,
      y: 0,
      transform: "",
    },
    size: {
      scale: 1.2,
      width: 0,
      height: 0,
    },
    style: "",

    _oldSize: {
      scale: 1,
      width: 0,
      height: 0,
    },
    _oldClientArray: [
      {
        x: 0,
        y: 0,
      },
    ],
    _oldPosition: {
      x: 0,
      y: 0,
    },
    _style: {},
    _pxToRpx: 0,
    _type: "image-controller",
    _isUpdate: false,
  },

  behaviors: ["wx://component-export"],

  observers: {
    "size.**"(size: typeof this.data.size) {
      this.setData({
        ["_style.width"]: `${size.width}rpx`,
        ["_style.height"]: `${size.height}rpx`,
        ["_style.transform"]: `scale(${size.scale})`,
      });
    },
    "position.**"(position: typeof this.data.position) {
      this.setData({
        ["_style.top"]: `${position.y}rpx`,
        ["_style.left"]: `${position.x}rpx`,
      });
    },
    "_style.**"() {
      this.setData({
        style: Object.entries(this.data._style)
          .map((_) => _.join(":"))
          .join(";"),
      });
    },
    async "src,container"(newValue, oldValue) {
      // 初始化
      if (newValue !== oldValue) {
        await this.setImageSize();
        await this.setPosition();

        const {width, height} = this.data.size;
        const {x, y} = this.data.position;

        this.triggerEvent("init", {
          x,
          y,
          width,
          height,
        } as ImageControllerInitEvent);
      }
    },
  },

  methods: {
    /**
     * 设置图片宽高
     *
     */
    async setImageSize() {
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
        imageHeight -= this.data.space;
      } else {
        imageHeight = containerHeight - this.data.space;
        imageWidth = imageHeight * imageProportion;
      }

      this.setData({
        "size.width": imageWidth,
        "size.height": imageHeight,
      });
    },

    /**
     *
     * 设置图片位置
     */
    async setPosition() {
      const {width: containerWidth, height: containerHeight} = this.data
        .container as Container;
      const {width, height} = this.data.size;

      const x = containerWidth / 2 - width / 2;
      const y = containerHeight / 2 - height / 2;

      this.setData({
        "position.x": x,
        "position.y": y,
      });
    },

    handleTouchStart(event: WechatMiniprogram.TouchEvent) {
      this.data._oldSize = {...this.data.size};
      this.data._oldPosition = {...this.data.position};
      this.data._oldClientArray = event.touches.map((_) => ({
        x: _.clientX,
        y: _.clientY,
      }));

      this.triggerEvent("controllerTouchStart", {
        type: this.data._type,
      });
    },

    checkBoundary(x: number, y: number) {
      const crop = this.data.crop as Crop;
      const {size} = this.data;
      const scale = 1 - size.scale;

      if (x + x * scale > crop.x) {
        x = crop.x + x * scale;
      } else if (
        x + size.width * scale + size.width - size.width * scale <
        crop.x + crop.width
      ) {
        x =
          crop.x +
          crop.width -
          ((size.width * Math.abs(scale)) / 2 + size.width);
      }

      // if (y * size.scale > crop.y * size.scale) {
      //   y = crop.y;
      // } else if (
      //   (y + size.height) * size.scale <
      //   (crop.y + crop.height) * size.scale
      // ) {
      //   y = crop.y + crop.height - size.height;
      // }

      return [x, y];
    },

    touchMove(event: WechatMiniprogram.TouchEvent) {
      if (this.data._isUpdate) return;

      const [oldClientFirst, oldClientSecond] = this.data._oldClientArray;
      const {_oldPosition, _pxToRpx} = this.data;

      this.data._isUpdate = true;

      if (event.touches.length === 1) {
        const [touch] = event.touches;
        const xDistance = (touch.clientX - oldClientFirst.x) * _pxToRpx;
        const yDistance = (touch.clientY - oldClientFirst.y) * _pxToRpx;

        let newX = _oldPosition.x + xDistance;
        let newY = _oldPosition.y + yDistance;

        [newX, newY] = this.checkBoundary(newX, newY);

        this.setData(
          {
            "position.x": newX,
            "position.y": newY,
          },
          () => {
            this.data._isUpdate = false;
          }
        );
      } else if (event.touches.length === 2) {
        const [clientFirst, clientSecond] = event.touches;

        const oldProportion = Math.sqrt(
          (oldClientFirst.x - oldClientSecond.x) ** 2 +
            (oldClientFirst.y - oldClientSecond.y) ** 2
        );

        const newProportion = Math.sqrt(
          (clientFirst.clientX - clientSecond.clientX) ** 2 +
            (clientFirst.clientY - clientSecond.clientY) ** 2
        );

        const newScale = (this.data.size.scale = newProportion / oldProportion);

        this.setData(
          {
            "size.scale": newScale,
          },
          () => {
            this.data._isUpdate = false;
          }
        );
      }
    },

    update() {
      console.log("image controller updated");
    },
  },

  lifetimes: {
    async attached() {
      this.data._pxToRpx = await getPxToRpx();
    },
  },

  export() {
    return {
      type: this.data._type,
      getPosition: () => {
        return {...this.data.position};
      },
      getSize: () => {
        return {...this.data.size};
      },
      update: this.update.bind(this),
      touchMove: this.touchMove.bind(this),
    } as ImageController;
  },
});
