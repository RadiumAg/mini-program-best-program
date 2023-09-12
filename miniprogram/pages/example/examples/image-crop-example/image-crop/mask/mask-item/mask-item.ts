/** @format */

import {Crop} from "../type";
import {props} from "./props";
import type {MaskItemPosition} from "./type";

Component({
  options: {
    pureDataPattern: /^_/, // 指定所有 _ 开头的数据字段为纯数据字段
  },

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
            "size.height": `${crop.y}rpx`,
          });
          break;
        }

        case "left": {
          this.setData({
            "size.width": `${crop.x}rpx`,
            "size.height": `${crop.height}rpx`,
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
