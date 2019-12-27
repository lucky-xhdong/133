<template>
  <div>

  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'layout',
  components: {
  },
  data() {
    return {
      sideHeight: document.body.clientHeight - 50
    }
  },
  methods: {
    // 自适应高度
    resize() {
      const that = this
      // _.debounce 是一个通过 lodash 限制操作频率的函数。
      window.onresize = _.debounce(() => {
        that.sideHeight = document.body.clientHeight - 50
      }, 400)
    }
  },
  created() {
  },
  mounted() {
    // 自适应高度
    this.resize()
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  body{
    /*min-width: 1155px*/
  }
</style>
