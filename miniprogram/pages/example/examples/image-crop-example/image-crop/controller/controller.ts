/** @format */

import { Crop } from "../type";
import { props } from "./prop";
import { Position, UpdateEvent } from "./type";

let activeTarget: unknown = null;

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
    typeClass: '',
    _oldPosition: {
      x: 0,
      y: 0
    },
    _oldClient: {
      x: 0,
      y: 0
    },

  },
  behaviors: ["wx://component-export"],

  properties: props,

  observers: {
  },

  methods: {
    _touchEnd() {
      activeTarget = null
    },

    _touchStart(event: WechatMiniprogram.TouchEvent) {
      const { x, y } = this.data.position;
      const [{ clientX, clientY }] = event.changedTouches;
      this.data._oldPosition = {
        x,
        y
      }
      this.data._oldClient = {
        x: clientX,
        y: clientY,
      }

      activeTarget = this;
    },

    _touchMove(event: WechatMiniprogram.TouchEvent) {
      if (activeTarget !== this) return;
      const position = this.data.type as Position;
      const { x: oldClientX, y: oldClientY } = this.data._oldClient;
      const [{ clientX, clientY }] = event.changedTouches;
      let xDistance = 0;
      let yDistance = 0;

      console.log(position)
      switch (position) {
        case 'top-left':
          xDistance = oldClientX - clientX;
          yDistance = oldClientY - clientY;
          break;

        default:
          break;
      }

      console.log(xDistance, yDistance)

      this.triggerEvent('update', {
        xDistance,
        yDistance
      } as UpdateEvent)
    },

    updated() {
      const crop = this.data.crop as Crop;
      const { width, height } = this.data.size;
      const position = this.data.type as Position;
      const typeClass = position.split('-').map((_, index) => index === 1 ? _[0].toUpperCase() + _.slice(1) : _).join('');

      switch (position) {
        case "top-left": {
          this.setData({
            "position.x": crop.x,
            "position.y": crop.y,
            typeClass,
          });

          break;
        }

        case "top-right": {
          this.setData({
            "position.x": crop.x + crop.width - width,
            "position.y": crop.y,
            typeClass
          });
          break;
        }

        case "bottom-left": {
          this.setData({
            "position.x": crop.x,
            "position.y": crop.y + crop.height - height,
            typeClass
          });
          break;
        }

        case "bottom-right": {
          this.setData({
            "position.x": crop.x + crop.width - width,
            "position.y": crop.y + crop.height - height,
            typeClass
          });
          break;
        }

        default:
          console.warn("controller设置位置错误");
      }
    }
  },

  lifetimes: {

  },

  export() {
    return {
      update: this.updated.bind(this)
    }
  }
});
