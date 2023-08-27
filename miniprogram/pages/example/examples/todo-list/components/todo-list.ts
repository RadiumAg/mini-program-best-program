// pages/example/examples/todo-list/todo-list.ts
Component({
  data: {
    toDoArray: [] as string[]
  },
  externalClasses: ["custom-class"],

  methods: {
    handleToDo(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
      const { detail: { value }, timeStamp } = event
      this.setData({
        [`toDoArray[${this.data.toDoArray.length}]`]: {
          value,
          timeStamp,
          isOk: false
        }
      })
    }
  }
})