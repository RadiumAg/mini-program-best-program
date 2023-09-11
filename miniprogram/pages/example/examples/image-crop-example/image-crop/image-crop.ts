/** @format */

import {props} from "./props";

import type {ActiveController, Container, Crop} from "./type";
import type {ControllerTouchStart, UpdateEvent} from "./controller/type";
import {getPxToRpx} from "./utils/page";

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

    _pxToRpx: 0,
    container: {} as Container,
    _isUpdate: false,
    _activeController: null as ActiveController,
    _controllerArray: [] as WechatMiniprogram.Component.TrivialInstance[],
  },

  methods: {
    handleControllerUpdate(event: WechatMiniprogram.CustomEvent<UpdateEvent>) {
      if (this.data._isUpdate) return;

      let {
        detail: {x, y, height, width},
      } = event;

      [x, y, width, height] = this._checkContainerBoundary(x, y, width, height);

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
          for (const controller of this.data._controllerArray) {
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

    _checkContainerBoundary(
      x: number,
      y: number,
      width: number,
      height: number
    ) {
      const bottomLeftController = this.data._controllerArray.find(
        (_) => _.type === "bottom-left"
      )!;
      const bottomRightController = this.data._controllerArray.find(
        (_) => _.type === "bottom-right"
      )!;

      const bottomRightControllerSize = bottomRightController.getSize();
      const bottomRightControllerPosition = bottomRightController.getPosition();
      const bottomLeftControllerSize = bottomLeftController.getSize();
      const bottomLeftControllerPosition = bottomLeftController.getPosition();

      if (x < this.data.container.left) {
        x = this.data.container.left;
        width =
          bottomRightControllerPosition.x + bottomRightControllerSize.width;
      } else if (
        x + width >
        this.data.container.left + this.data.container.width
      ) {
        width =
          this.data.container.left +
          this.data.container.width -
          bottomLeftControllerPosition.x;
      }

      if (y < this.data.container.top) {
        y = this.data.container.top;
        height =
          bottomLeftControllerPosition.y +
          bottomLeftControllerSize.height -
          this.data.container.top;
      } else if (
        y + height >
        this.data.container.height + this.data.container.top
      ) {
        height = this.data.container.height - y;
      }

      return [x, y, width, height];
    },
  },

  async attached() {
    this.data._pxToRpx = await getPxToRpx();

    this.data._controllerArray = this.selectAllComponents(".controller");
    this.data._controllerArray.forEach((_) => _.update());

    this.createSelectorQuery()
      .select(".imageCrop")
      .boundingClientRect()
      .exec(([container]) => {
        if (container === null) return;

        Object.keys(container).forEach((key) => {
          const value = container[key];
          if (typeof value === "number") {
            container[key] = value * this.data._pxToRpx;
          }
        });

        this.setData({
          container,
        });
      });
  },
});
