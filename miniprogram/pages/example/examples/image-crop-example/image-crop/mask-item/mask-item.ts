/** @format */

import {Crop} from "../type";
import {props} from "./props";
import type {MaskItemPosition} from "./type";

Component({
  behaviors: ["wx://component-export"],
  /**
   * 组件的属性列表
   */
  properties: props,

  /**
   * 组件的初始数据
   */
  data: {
    size: {
      with: 0,
      height: 0,
    },
    autoFillClass: "",
  },

  observers: {
    crop() {
      this.update();
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    update() {
      const crop = this.data.crop as Crop;
      const position = this.data.position as MaskItemPosition;

      switch (position) {
        case "top": {
          this.setData({
            "size.width": "100%",
            "size.height": crop.x,
          });
          break;
        }

        case "left": {
          this.setData({
            "size.width": crop.x,
            "size.height": crop.height,
          });
          break;
        }

        default:
          console.warn("请检查position类型");
      }
    },
  },

  lifetimes: {},

  export() {
    return {
      update: this.update.bind(this),
    };
  },
});
