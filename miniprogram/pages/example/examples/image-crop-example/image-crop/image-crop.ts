/** @format */

import type { UpdateEvent } from "./controller/type";
import { props } from "./props";
import { Crop } from "./type";

Component({
  externalClasses: ["view-class"],

  properties: props,

  data: {
    crop: {
      x: 40,
      y: 20,
      height: 500,
      width: 500,
    } as Crop,
  },

  methods: {
    handleControllerUpdate(event: WechatMiniprogram.CustomEvent<UpdateEvent>) {
      const { detail: { xDistance, yDistance } } = event;

      this.setData({
        crop: {
          y: 20,
          x: this.data.crop.x + xDistance,
          height: 500,
          width: this.data.crop.width + xDistance,
        }
      }, () => {
        const controllerArray = this.selectAllComponents('.controller');
        controllerArray.forEach(_ => _.update())
      })
    }
  },


  attached() {
    const controllerArray = this.selectAllComponents('.controller');
    controllerArray.forEach(_ => _.update())
  }
});
