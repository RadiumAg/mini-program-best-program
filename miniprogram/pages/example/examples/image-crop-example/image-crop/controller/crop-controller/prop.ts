/** @format */

import type {Crop} from "../../crop/type";
import type {Container} from "../../type";

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

  container: {
    type: Object,
    value: {
      top: 0,
      left: 0,
      width: 0,
      right: 0,
      height: 0,
    } as Container,
  },

  type: {
    type: String,
  },
};

export {props};
