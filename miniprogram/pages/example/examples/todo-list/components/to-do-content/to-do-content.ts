import { trimSingleValue } from "tdesign-miniprogram/slider/tool"

// pages/example/examples/todo-list/components/to-do-content/to-do-content.ts
Component({

  externalClasses: ['custom-class'],
  /**
   * 组件的属性列表
   */
  properties: {
    toDoArray: Array
  },

  observers: {},

  /**
   * 组件的初始数据
   */
  data: {

  },


  /**
   * 组件的方法列表
   */
  methods: {
    handleStatusChange(event: WechatMiniprogram.CustomEvent<{ value: { timeStamp: number }[] }>) {
      this.data.toDoArray.forEach(_ => (_.isOk = false))
      this.setData({ toDoArray: this.data.toDoArray })

      event.detail.value.forEach(_ => {
        const targetIndex = this.data.toDoArray.findIndex(toDo => toDo.timeStamp === +_)
        this.setData({ [`toDoArray[${targetIndex}].isOk`]: true })
      })
    }
  }
})
