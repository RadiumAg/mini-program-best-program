/** @format */

import {props} from "./props";
import {getPxToRpx} from "../../utils/page";
import type {Container} from "../../type";
import type {Crop} from "../../crop/type";
import type {ImageController, ImageControllerInitEvent} from "./type";

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
      scale: 1,
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
    _isScaleLock: false,
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

    getActualPositionAndSize() {
      const {size, position} = this.data;

      const {x, y, width, height} = this.transformToActualPositionAndSize(
        position.x,
        position.y,
        size.width,
        size.height,
        size.scale
      );

      return {
        x,
        y,
        width,
        height,
      };
    },

    transformToActualPositionAndSize(
      x: number,
      y: number,
      width: number,
      height: number,
      scale: number
    ) {
      const oldWidth = width;
      const oldHeight = height;

      width = oldWidth * scale;
      height = oldHeight * scale;

      x = x + (oldWidth - width) / 2;
      y = y + (oldHeight - height) / 2;

      return {
        x,
        y,
        width,
        height,
      };
    },

    checkBoundary(x: number, y: number, size: typeof this.data.size) {
      const crop = this.data.crop as Crop;
      const xInscrease = (size.width - size.width * size.scale) / 2;
      const yInscrease = (size.height - size.height * size.scale) / 2;

      if (x + xInscrease > crop.x) {
        x = crop.x - xInscrease;

        console.log("左触底");
      } else if (
        x + xInscrease + size.width * size.scale <
        crop.x + crop.width
      ) {
        x = crop.x + crop.width - size.width * size.scale - xInscrease;

        console.log("右触底");
      }

      if (y + yInscrease > crop.y) {
        y = crop.y - yInscrease;

        console.log("上触底");
      } else if (
        y + yInscrease + size.height * size.scale <
        crop.y + crop.height
      ) {
        y = crop.y + crop.height - size.height * size.scale - yInscrease;

        console.log("下触底");
      }

      return [x, y];
    },

    checkScale(x: number, y: number, size: typeof this.data.size) {
      let scale = size.scale;
      const crop = this.data.crop as Crop;

      const xYInscrease = {
        get xInscrease() {
          return (size.width - size.width * scale) / 2;
        },

        get yInscrease() {
          console.log(scale);
          return (size.height - size.height * scale) / 2;
        },
      };

      const checkLeftRight = () => {
        if (
          x + xYInscrease.xInscrease >= crop.x &&
          x + xYInscrease.xInscrease + size.width * scale <= crop.x + crop.width
        ) {
          // 缩小过程中同时靠边
          scale = crop.width / size.width;
          x = crop.x - xYInscrease.xInscrease;

          this.data._isScaleLock = true;
          console.log("左右同时靠边");
        } else if (x + xYInscrease.xInscrease >= crop.x) {
          // 缩小过程中左边靠边
          x = crop.x - xYInscrease.xInscrease;

          console.log("左边靠边");
        } else if (
          // 缩小过程中右边靠边
          x + xYInscrease.xInscrease + size.width * scale <=
          crop.x + crop.width
        ) {
          x = crop.x + crop.width - size.width * scale - xYInscrease.xInscrease;

          console.log("右边靠边");
        }
      };

      const checkTopBottom = () => {
        if (
          y + xYInscrease.yInscrease >= crop.y &&
          y + xYInscrease.yInscrease + size.height * scale <=
            crop.y + crop.height
        ) {
          scale = crop.height / size.height;
          y = crop.y - xYInscrease.yInscrease;
          this.data._isScaleLock = false;

          console.log("上下靠边");
        } else if (y + xYInscrease.yInscrease >= crop.y) {
          y = crop.y - xYInscrease.yInscrease;

          console.log("上靠边");
        } else if (
          y + xYInscrease.yInscrease + size.height * scale <=
          crop.y + crop.height
        ) {
          y =
            crop.y + crop.height - size.height * scale - xYInscrease.yInscrease;

          console.log("下靠边");
        }
      };

      const checkArray = [checkLeftRight];

      if (this.data._isScaleLock) {
        checkArray.push(checkTopBottom);
      } else {
        checkArray.unshift(checkTopBottom);
      }

      checkArray.forEach((_) => _());

      return [x, y, scale];
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

        [newX, newY] = this.checkBoundary(newX, newY, this.data.size);

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
        const {x, y} = this.data.position;
        const {scale} = this.data._oldSize;
        const [clientFirst, clientSecond] = event.touches;

        const oldProportion = Math.sqrt(
          (oldClientFirst.x - oldClientSecond.x) ** 2 +
            (oldClientFirst.y - oldClientSecond.y) ** 2
        );

        const newProportion = Math.sqrt(
          (clientFirst.clientX - clientSecond.clientX) ** 2 +
            (clientFirst.clientY - clientSecond.clientY) ** 2
        );

        let newScale = scale + (newProportion / oldProportion - 1);
        let newX = 0;
        let newY = 0;

        if (newScale > this.data.maxScale) {
          newScale = this.data.maxScale;
        } else if (newScale < this.data.minScale) {
          newScale = this.data.minScale;
        }

        [newX, newY, newScale] = this.checkScale(x, y, {
          ...this.data.size,
          scale: newScale,
        });

        this.setData(
          {
            "position.x": newX,
            "position.y": newY,
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
      getActualPositionAndSize: this.getActualPositionAndSize.bind(this),
    } as ImageController;
  },
});
