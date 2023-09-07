/** @format */

import type { Crop } from "../type";

const props = {
  crop: {
    type: Object,
    value: {
      x: 0,
      y: 0,
      height: 0,
      width: 0,
    } as Crop,
  },

  type: {
    type: String,
  },
};

export { props };
