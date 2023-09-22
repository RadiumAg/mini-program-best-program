/** @format */

import type {Crop} from "../../crop/type";

const props = {
  crop: {
    type: Object,
    value: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    } as Crop,
  },

  imageController: {
    type: Object,
  },

  src: {
    type: String,
  },
};

export {props};
