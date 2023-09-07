/** @format */

import {props} from "./props";
import {Crop} from "./type";

Component({
  externalClasses: ["view-class"],

  properties: props,

  data: {
    crop: {
      x: 40,
      y: 20,
      height: 200,
      width: 100,
    } as Crop,
  },

  methods: {},
});
