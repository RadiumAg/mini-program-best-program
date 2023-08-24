import transition from "../../../../../utils/transition";

// pages/example/examples/dialog/dialog/dialog.ts
Component({
  options: {
    multipleSlots: true,
  },
  behaviors: [transition()],

  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleOverlayClick() {
      this.triggerEvent('confirm', { trigger: 'overlay', visible: false })
    }
  }
})
