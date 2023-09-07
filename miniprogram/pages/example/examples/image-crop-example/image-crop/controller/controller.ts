/** @format */

import {Crop} from "../type";
import {props} from "./prop";
import {Position} from "./type";

Component({
  data: {
    position: {
      x: 0,
      y: 0,
      width: 66,
      height: 66,
    },
  },

  properties: props,

  methods: {},

  lifetimes: {
    attached() {
      const crop = this.data.crop as Crop;
      const position = this.data.position as Position;

      switch (position) {
        case "left-top": {
          this.setData({
            "position.x": crop.x,
            "position.y": crop.y,
          });
          break;
        }

        case "right-top": {
          this.setData({
            "position.x": crop.x + crop.width - 66,
            "position.y": crop.y,
          });
          break;
        }

        default:
          console.warn("设置位置错误");
      }
    },
  },
});
