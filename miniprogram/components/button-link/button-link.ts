// components/button-link/button-link.ts
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    label: {
      type: String
    },
    url:{
      type:String
    } 
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
        handleToPage(){
         wx.navigateTo({url:this.data.url}).catch((reason)=>{
           console.error(reason)
         })
       }
  }
})
