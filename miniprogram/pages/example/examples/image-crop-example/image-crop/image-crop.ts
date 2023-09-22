/** @format */

import {props} from "./props";
import {getPxToRpx} from "./utils/page";

import type {Container} from "./type";
import type {
  Controller,
  ControllerTouchStart,
  MoveEvent,
} from "./controller/crop-controller/type";
import type {
  ImageController,
  ImageControllerInitEvent,
} from "./controller/image-controller/type";
import type {Crop} from "./crop/type";
import {CanvasController} from "./controller/canvas-controller/type";

Component({
  options: {
    pureDataPattern: /^_/, // 指定所有 _ 开头的数据字段为纯数据字段
  },

  externalClasses: ["view-class"],

  properties: props,

  data: {
    crop: {
      x: 40,
      y: 20,
      height: 500,
      width: 500,
    } as Crop,
    container: {} as Container,

    _pxToRpx: 0,
    _isUpdate: false,
    _cropControllerArray: [] as Controller[],
    _imageController: null as ImageController | null,
    _canvasController: null as CanvasController | null,
    _activeController: null as Controller | ImageController | null,
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

    handleCropControllerMove(event: WechatMiniprogram.CustomEvent<MoveEvent>) {
      if (this.data._isUpdate) return;

      let {
        detail: {x, y, height, width},
      } = event;

      [x, y, width, height] = this.checkBoundary(x, y, width, height);

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
          for (const controller of this.data._cropControllerArray.filter(
            (_) => _.type !== "image-controller"
          )) {
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
      const controllers = [
        this.data._imageController,
        ...this.data._cropControllerArray,
      ];
      const {type} = event.detail;

      this.data._activeController = controllers.find((_) => _.type === type)!;
    },

    async handleComplete() {
      const {_canvasController} = this.data;
      console.log(_canvasController?.cut());
    },

    checkBoundary(x: number, y: number, width: number, height: number) {
      const checkArray = [this.checkContainerBoundary, this.checkImageBoundary];

      const checkResult = checkArray.reduce(
        (pre, current) => {
          return current.call(
            this,
            ...(pre as [number, number, number, number])
          );
        },
        [x, y, width, height]
      );

      return checkResult;
    },

    checkContainerBoundary(
      x: number,
      y: number,
      width: number,
      height: number
    ) {
      if (this.data._activeController === null) return [x, y, width, height];

      const bottomLeftController = this.data._cropControllerArray.find(
        (_) => _.type === "bottom-left"
      )!;
      const bottomRightController = this.data._cropControllerArray.find(
        (_) => _.type === "bottom-right"
      )!;

      const bottomRightControllerSize = bottomRightController.getSize();
      const bottomRightControllerPosition = bottomRightController.getPosition();

      const bottomLeftControllerSize = bottomLeftController.getSize();
      const bottomLeftControllerPosition = bottomLeftController.getPosition();

      if (x < this.data.container.left) {
        x = this.data.container.left;
        width =
          bottomRightControllerPosition.x + bottomRightControllerSize.width - x;
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
          this.data._activeController.type === "top-right" ||
          this.data._activeController.type === "bottom-right"
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
          this.data._activeController.type === "bottom-left" ||
          this.data._activeController.type === "bottom-right"
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

    checkImageBoundary(x: number, y: number, width: number, height: number) {
      const {_imageController: imageController} = this.data;

      if (imageController === null) return [x, y, width, height];

      const bottomLeftController = this.data._cropControllerArray.find(
        (_) => _.type === "bottom-left"
      )!;
      const bottomRightController = this.data._cropControllerArray.find(
        (_) => _.type === "bottom-right"
      )!;

      const bottomRightControllerSize = bottomRightController.getSize();
      const bottomRightControllerPosition = bottomRightController.getPosition();

      const bottomLeftControllerSize = bottomLeftController.getSize();
      const bottomLeftControllerPosition = bottomLeftController.getPosition();

      const {
        x: imageControllerX,
        y: imageControllerY,
        width: imageControllerWidth,
        height: imageControllerHeight,
      } = imageController.getActualPositionAndSize();

      if (x < imageControllerX) {
        x = imageControllerX;
        width =
          bottomRightControllerPosition.x + bottomRightControllerSize.width - x;
        console.log("image-crop 左靠边");
      } else if (x + width > imageControllerX + imageControllerWidth) {
        width = imageControllerX + imageControllerWidth - x;
        console.log("image-crop 右靠边");
      }

      if (y < imageControllerY) {
        y = imageControllerY;
        height =
          bottomLeftControllerPosition.y + bottomLeftControllerSize.height - y;
        console.log("image-crop 上靠边");
      } else if (y + height > imageControllerY + imageControllerHeight) {
        height = imageControllerY + imageControllerHeight - y;
        console.log("image-crop 下靠边");
      }

      return [x, y, width, height];
    },
  },

  async attached() {
    this.data._pxToRpx = await getPxToRpx();

    this.data._cropControllerArray = this.selectAllComponents(
      ".controller"
    ) as unknown as Controller[];
    this.data._cropControllerArray.forEach((_) => _.update());

    this.setData({
      _imageController: this.selectComponent(
        ".image-controller"
      ) as unknown as ImageController,
    });

    this.data._canvasController = this.selectComponent(
      ".canvas-controller"
    ) as unknown as CanvasController;

    this.createSelectorQuery()
      .select(".view-area")
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
