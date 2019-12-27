<template>
  <el-cascader
    :options="orgOptions"
    v-model="selectedOptions"
    placeholder="请选择组织"
    :change-on-select="true"
    :props="defaultProps"
    @change="getUsersUnlimited"
    clearable>
  </el-cascader>
</template>

<script>
  import { getAllUpmsOrgList } from '@/api/org/org-api'

  export default {
    name: 'orgTree',

    data() {
      return {
        orgOptions: [],
        selectedOptions: [],
        defaultProps: {
          value: 'id',
          label: 'name',
          children: 'nodes'
        }
      }
    },

    methods: {
      // 查询组织树状结构
      getOrgTree() {
        new Promise((resolve, reject) => {
          getAllUpmsOrgList().then(response => {
            this.orgOptions = response.data
            resolve(response)
          }).catch(error => {
            reject(error)
          })
        })
      },
      getUsersUnlimited() {
        this.$emit('getUsersUnlimited')
      }
    },

    created() {
      this.getOrgTree()
    }
  }
</script>

<style scoped>

</style>
