/** @format */

const getPxToRpx = async () => {
  const {screenWidth} = await wx.getSystemInfo();
  return +(750 / screenWidth).toFixed(2);
};

const getRotateWidthHeight = (
  width: number,
  height: number,
  rotate: number
) => {
  if (rotate % 180 === 0) {
    [width, height] = [width, height];
  } else {
    [height, width] = [width, height];
  }

  return [width, height];
};

export {getPxToRpx, getRotateWidthHeight};
