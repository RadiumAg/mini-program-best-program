/** @format */

Component({
  data: {},
  properties: {},
  methods: {
    handleCancel() {
      this.triggerEvent("cancel");
    },

    handleRotate() {
      this.triggerEvent("rotate");
    },

    handleComplete() {
      this.triggerEvent("complete");
    },
  },
});
