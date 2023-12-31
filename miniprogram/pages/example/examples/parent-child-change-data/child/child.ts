// pages/example/examples/parent-child-change-data/child/child.ts
Component({
  /**
   * 组件的属性列表
   */
  externalClasses: ['custom-class'],
  properties: {
    value: {
      type: Number
    },
  },

  observers: {},

  /**
   * 组件的初始数据
   */
  data: {

  },

  created() {
    console.log(this)
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleTap() {
      this.triggerEvent('updatevalue', { value: this.data.value + 1 })
    },
  },
})
