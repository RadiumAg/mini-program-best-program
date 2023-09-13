/** @format */

import type {Crop} from "../../crop/type";
import type {Container} from "../../type";

const props = {
  src: {
    type: String,
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
  space: {
    type: Number,
    value: 50,
  },
  crop: {
    type: Object,
    value: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    } as Crop,
  },
};

export {props};
