/** @format */

import {Crop} from "../type";
import {props} from "./prop";
import {ControllerTouchStart, Position, UpdateEvent} from "./type";

Component({
  data: {
    position: {
      x: 0,
      y: 0,
    },
    size: {
      width: 66,
      height: 66,
    },
    typeClass: "",
    _oldPosition: {
      x: 0,
      y: 0,
    },
    _oldClient: {
      x: 0,
      y: 0,
    },
    _oldCrop: {} as Crop,
    _pxToRpx: 0,
  },
  behaviors: ["wx://component-export"],

  properties: props,

  observers: {},

  methods: {
    handleTouchStart(event: WechatMiniprogram.TouchEvent) {
      const {x, y} = this.data.position;
      const [{clientX, clientY}] = event.changedTouches;
      this.data._oldPosition = {
        x,
        y,
      };
      this.data._oldClient = {
        x: clientX,
        y: clientY,
      };

      this.data._oldCrop = {...this.data.crop} as Crop;

      this.triggerEvent("controllerTouchStart", {
        type: this.data.type,
      } as ControllerTouchStart);
    },

    _touchMove(event: WechatMiniprogram.TouchEvent) {
      const position = this.data.type as Position;
      const {x: oldClientX, y: oldClientY} = this.data._oldClient;
      const [{clientX, clientY}] = event.changedTouches;
      let newX = 0;
      let newY = 0;
      let newHeight = 0;
      let newWidth = 0;

      switch (position) {
        case "top-left": {
          const {x, y, height, width} = this.data._oldCrop;

          const xDistance = (clientX - oldClientX) * this.data._pxToRpx;
          const yDistance = (clientY - oldClientY) * this.data._pxToRpx;

          newX = x + xDistance;
          newY = y + yDistance;
          newWidth = width - xDistance;
          newHeight = height - yDistance;

          break;
        }

        case "top-right": {
          const {x, y, height, width} = this.data._oldCrop;

          const xDistance = (clientX - oldClientX) * this.data._pxToRpx;
          const yDistance = (clientY - oldClientY) * this.data._pxToRpx;

          newX = x;
          newY = y + yDistance;
          newWidth = width + xDistance;
          newHeight = height - yDistance;

          break;
        }

        case "bottom-left": {
          const {x, y, height, width} = this.data._oldCrop;

          const xDistance = (clientX - oldClientX) * this.data._pxToRpx;
          const yDistance = (clientY - oldClientY) * this.data._pxToRpx;

          newX = x + xDistance;
          newY = y;
          newWidth = width - xDistance;
          newHeight = height + yDistance;

          break;
        }

        case "bottom-right": {
          const {x, y, height, width} = this.data._oldCrop;

          const xDistance = (clientX - oldClientX) * this.data._pxToRpx;
          const yDistance = (clientY - oldClientY) * this.data._pxToRpx;

          newX = x;
          newY = y;
          newWidth = width + xDistance;
          newHeight = height + yDistance;

          break;
        }
      }

      this.triggerEvent("update", {
        x: newX,
        y: newY,
        height: newHeight,
        width: newWidth,
      } as UpdateEvent);
    },

    updated() {
      let resolveFn: (value: unknown) => void;

      const promise = new Promise((resolve) => {
        resolveFn = resolve;
      });

      const crop = this.data.crop as Crop;
      const {width, height} = this.data.size;
      const position = this.data.type as Position;
      const typeClass = position
        .split("-")
        .map((_, index) => (index === 1 ? _[0].toUpperCase() + _.slice(1) : _))
        .join("");

      switch (position) {
        case "top-left": {
          this.setData(
            {
              "position.x": crop.x,
              "position.y": crop.y,
              typeClass,
            },
            () => {
              resolveFn("updated");
            }
          );

          break;
        }

        case "top-right": {
          this.setData(
            {
              "position.x": crop.x + crop.width - width,
              "position.y": crop.y,
              typeClass,
            },
            () => {
              resolveFn("updated");
            }
          );
          break;
        }

        case "bottom-left": {
          this.setData(
            {
              "position.x": crop.x,
              "position.y": crop.y + crop.height - height,
              typeClass,
            },
            () => {
              resolveFn("updated");
            }
          );
          break;
        }

        case "bottom-right": {
          this.setData(
            {
              "position.x": crop.x + crop.width - width,
              "position.y": crop.y + crop.height - height,
              typeClass,
            },
            () => {
              resolveFn("updated");
            }
          );
          break;
        }

        default:
          console.warn("controller设置位置错误");
      }

      return promise;
    },
  },

  lifetimes: {
    async attached() {
      const {screenWidth} = await wx.getSystemInfo();
      this.data._pxToRpx = 750 / screenWidth;
      console.log(this.data._pxToRpx);
    },
  },

  export() {
    return {
      update: this.updated.bind(this),
      touchMove: this._touchMove.bind(this),
      type: this.data.type,
    };
  },
});
