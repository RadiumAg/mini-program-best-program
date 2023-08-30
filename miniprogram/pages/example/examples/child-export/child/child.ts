// pages/example/examples/child-export/child/child.ts
Component({
  behaviors: ['wx://component-export'], // 重点

  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    value: 1
  },

  /**
   * 组件的方法列表
   */
  methods: {

  },

  export() {
    return {
      up: () => {
        this.setData({
          value: this.data.value + 1
        })
      }
    }
  }
})
