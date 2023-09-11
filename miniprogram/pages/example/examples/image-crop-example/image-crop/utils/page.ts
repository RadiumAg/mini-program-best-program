/** @format */

const getPxToRpx = async () => {
  const {screenWidth} = await wx.getSystemInfo();
  return +(750 / screenWidth).toFixed(2);
};

export {getPxToRpx};
