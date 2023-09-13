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
      width: 0,
      height: 0,
    },
    style: "",

    _oldSize: {
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
      transform: "",
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
      });
    },
    "position.**"(position: typeof this.data.position) {
      this.setData({
        ["_style.top"]: `${position.y}rpx`,
        ["_style.left"]: `${position.x}rpx`,
        ["_style.transform"]: `transform:${position.transform}`,
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
        size: {
          width: imageWidth,
          height: imageHeight,
        },
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
        position: {
          x,
          y,
        },
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

    touchMove(event: WechatMiniprogram.TouchEvent) {
      if (this.data._isUpdate) return;

      const [clientFirst, clientSecond] = this.data._oldClientArray;
      const crop = this.data.crop as Crop;

      this.data._isUpdate = true;

      if (event.touches.length === 1) {
        const [touch] = event.touches;
        const xDistance = (touch.clientX - clientFirst.x) * this.data._pxToRpx;
        const yDistance = (touch.clientY - clientFirst.y) * this.data._pxToRpx;

        let newX = this.data._oldPosition.x + xDistance;
        let newY = this.data._oldPosition.y + yDistance;

        if (newX > crop.x) {
          newX = crop.x;
        } else if (newX + this.data.size.width < crop.x + crop.width) {
          newX = crop.x + crop.width - this.data.size.width;
        }

        if (newY > crop.y) {
          newY = crop.y;
        } else if (newY + this.data.size.height < crop.y + crop.height) {
          newY = crop.y + crop.height - this.data.size.height;
        }

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
