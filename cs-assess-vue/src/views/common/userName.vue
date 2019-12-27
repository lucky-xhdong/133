<template>
  <el-select v-model="appliedUserId" filterable placeholder="请选择姓名" clearable>
    <el-option
      v-for="(item, index) in appliedUserList"
      :key=index
      :label="item.label"
      :value="item.key">
    </el-option>
  </el-select>
</template>
<script>
  import { getUserId2NameMap } from '@/api/users/user-api'
  export default {
    data() {
      return {
        appliedUserList: [],
        appliedUserId: ''
      }
    },
    created() {
      this.getUserId2NameMap()
    },
    methods: {
      /**
       * 新增表扬弹窗--获取姓名
       */
      getUserId2NameMap() {
        return new Promise((resolve, reject) => {
          getUserId2NameMap().then(res => {
            this.appliedUserList = res.data
            resolve(res)
          }).catch(error => {
            reject(error)
          })
        })
      }
    }
  }
</script>
