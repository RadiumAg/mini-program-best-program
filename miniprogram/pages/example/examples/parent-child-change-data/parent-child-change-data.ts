// pages/example/examples/parent-child-change-data/parent-child-change-data.ts
Component({

  /**
   * 页面的初始数据
   */
  data: {
    value: 1,
    modelValue: 1,
  },

  observers: {
    modelValue(value) {
      console.log(value)
    }
  },

  methods: {
    handleUpdate(event: WechatMiniprogram.CustomEvent<{ value: number }>) {
      console.log(event)
      this.setData({ value: event.detail.value })
    }
  }
})