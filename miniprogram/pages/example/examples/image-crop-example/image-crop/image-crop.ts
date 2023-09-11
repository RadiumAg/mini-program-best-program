/** @format */

import {props} from "./props";
import {getPxToRpx} from "./utils/page";

import type {ActiveController, Container, Crop} from "./type";
import type {ControllerTouchStart, UpdateEvent} from "./controller/type";
import type {ImageControllerInitEvent} from "./image-controller/type";

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
    handleImagecontrollerInit(
      event: WechatMiniprogram.CustomEvent<ImageControllerInitEvent>
    ) {
      const {x, y, width, height} = event.detail;

      this.setData({
        crop: {
          x,
          y,
          width,
          height,
        },
      });
    },

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

      if (width < bottomLeftControllerSize.width * 2) {
        if (
          this.data._activeController?.type === "top-right" ||
          this.data._activeController?.type === "bottom-right"
        ) {
          width = bottomLeftControllerSize.width * 2;
        } else {
          width = bottomLeftControllerSize.width * 2;
          x =
            bottomRightControllerPosition.x +
            bottomRightControllerSize.width -
            width;
        }
      }

      if (height < bottomLeftControllerSize.height * 2) {
        if (
          this.data._activeController?.type === "bottom-left" ||
          this.data._activeController?.type === "bottom-right"
        ) {
          height = bottomLeftControllerSize.height * 2;
        } else {
          height = bottomLeftControllerSize.height * 2;
          y =
            bottomRightControllerPosition.y +
            bottomRightControllerSize.height -
            height;
        }
      }

      return [x, y, width, height];
    },
  },

  async attached() {
    this.data._pxToRpx = await getPxToRpx();

    this.data._controllerArray = this.selectAllComponents(".controller");
    this.data._controllerArray.forEach((_) => _.update());

    this.createSelectorQuery()
      .select(".image-crop")
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
