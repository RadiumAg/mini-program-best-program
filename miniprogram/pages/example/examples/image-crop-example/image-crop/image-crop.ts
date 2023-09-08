/** @format */

import {props} from "./props";

import type {ActiveController, Crop} from "./type";
import type {ControllerTouchStart, UpdateEvent} from "./controller/type";

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

    _isUpdate: false,

    _activeController: null as ActiveController,
  },

  methods: {
    handleControllerUpdate(event: WechatMiniprogram.CustomEvent<UpdateEvent>) {
      if (this.data._isUpdate) return;
      const {
        detail: {x, y, height, width},
      } = event;

      this.data._isUpdate = true;

      this.setData(
        {
          crop: {
            y,
            x,
            height,
            width,
          },
        },
        async () => {
          const controllerArray = this.selectAllComponents(".controller");

          for (const controller of controllerArray) {
            await controller.update();
          }

          this.data._isUpdate = false;
        }
      );
    },

    handleTouchMove(event: WechatMiniprogram.TouchEvent) {
      if (this.data._isUpdate) return;
      this.data._activeController?.touchMove(event);
    },

    handleTouchEnd() {
      this.data._activeController = null;
    },

    handeControllerTouchStart(
      event: WechatMiniprogram.CustomEvent<ControllerTouchStart>
    ) {
      const {type} = event.detail;
      const controllerArray = this.selectAllComponents(".controller");

      this.data._activeController = controllerArray.find(
        (_) => _.type === type
      )!;
    },
  },

  attached() {
    const controllerArray = this.selectAllComponents(".controller");
    controllerArray.forEach((_) => _.update());
  },
});
