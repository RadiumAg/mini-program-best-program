// pages/example/examples/todo-list/components/header/header.ts
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    toDoTitle: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleAdd() {
      this.triggerEvent('addtodo', { value: this.data.toDoTitle })
      this.setData({ toDoTitle: '' })
    },

    handleInputChange(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
      const { value: toDoTitle } = event.detail
      this.data.toDoTitle = toDoTitle
    }
  }
})
