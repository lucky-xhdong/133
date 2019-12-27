<template>
  <div class="app-container">

    <!-- 查询条件 start -->
    <div class="filter-container">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="考核月份" prop="assessDate">
          <el-date-picker
            v-model="queryForm.assessDate"
            type="month"
            placeholder="请选择月份"
            value-format="yyyy-MM">
          </el-date-picker>
        </el-form-item>

        <el-form-item label="组织结构">
          <org-tree ref="orgTree"></org-tree>
        </el-form-item>

        <el-form-item label="客服姓名">
          <el-input @keyup.enter.native="handleFilter" class="filter-item" placeholder="请输入客服姓名" clearable
                    v-model="queryForm.trueName">
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button class="filter-item" type="primary" icon="el-icon-search" @click="getDataList"
                     :loading="listLoading">搜索
          </el-button>
          <el-button class="filter-item" type="info" icon="el-icon-error" @click="handleResetFilter"
                     :loading="listLoading">重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="dataList" style="width: 100%" :max-height="tableHeight" stripe highlight-current-row border>

      <el-table-column align="center" label="客服工号" fixed width="120">
        <template slot-scope="scope">
          <span>{{scope.row.userInfo.agentNo}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="姓名" fixed width="120">
        <template slot-scope="scope">
          <span>{{scope.row.userInfo.trueName}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" v-for="(value, key) in itemMap" :key="key" :label="value" width="160">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <el-input type="number" v-model="scope.row[key].dataValue" class="edit-input" size="small"/>
          </template>
          <span v-else>{{ scope.row[key].dataValue }}</span>
        </template>
      </el-table-column>

      <el-table-column fixed="right" label="操作" width="200" v-if="userEmail === 'liyang01@133.cn'">
        <template slot-scope="scope">
          <el-button v-if="scope.row.edit" type="success" size="small" icon="el-icon-circle-check-outline" @click="updateData(scope.row)">提交</el-button>
          <el-button v-else type="primary" size="small" icon="el-icon-edit" @click="editData(scope.row)">编辑</el-button>
          <el-button v-if="scope.row.edit" class="cancel-btn" size="small" icon="el-icon-refresh" type="warning" @click="cancelEdit(scope.row)">取消</el-button>
        </template>
      </el-table-column>

    </el-table>
  </div>
</template>

<script>
  import _ from 'lodash'
  import { getUser } from '@/api/users/user-api'
  import { getOriginDataList, updateOriginData } from '@/api/kpi/original-data-api'
  import { getAllDataItemInfo } from '@/api/common/dict-api'
  import { parseTime } from '@/utils'
  import orgTree from '../../common/orgTree'

  export default {
    name: 'originalData',
    components: { orgTree },

    data() {
      return {
        dataList: [],
        queryForm: {
          assessDate: '',
          orgId: 0,
          trueName: ''
        },
        listLoading: false,
        itemMap: {}, // 考核项信息键值对
        tableHeight: document.body.clientHeight - 120,
        // 原始值
        originalRow: {},
        userEmail: ''
      }
    },
    methods: {
      // 获取用户信息
      getUser() {
        return new Promise((resolve, reject) => {
          getUser().then((res) => {
            this.userEmail = res.data.email
            resolve(res)
          }).catch((error) => {
            reject(error)
          })
        })
      },
      getDataList() {
        if (!this.queryForm.assessDate) {
          this.$message({
            message: '请选择考核月份',
            type: 'error',
            showClose: true
          })
          return
        }
        this.listLoading = true

        // 设置组织结构查询条件
        if (this.$refs.orgTree) {
          const selectedOptionsArr = this.$refs.orgTree.selectedOptions
          this.queryForm.orgId = ''
          if (selectedOptionsArr && selectedOptionsArr.length > 1) {
            this.queryForm.orgId = selectedOptionsArr[selectedOptionsArr.length - 1]
          }
        }

        new Promise((resolve, reject) => {
          getOriginDataList(this.queryForm).then(response => {
            this.dataList = response.data.map(v => {
              this.$set(v, 'edit', false)
              return v
            })
            this.listLoading = false
            resolve(response)
          }).catch(error => {
            this.listLoading = false
            reject(error)
          })
        })
      },
      // 获取考核项键值对
      getDataItemMap() {
        new Promise((resolve, reject) => {
          getAllDataItemInfo().then(response => {
            this.itemMap = response.data
            resolve(response)
          }).catch(error => {
            reject(error)
          })
        })
      },

      // 编辑
      editData(row) {
        // 编辑的时候判断是否有其他行在编辑
        if (this.originalRow.rowEdit) {
          this.originalRow.rowEdit.edit = false
        }
        // 将值改为true
        row.edit = !row.edit
        // 将原始值放入全局变量中
        this.originalRow = JSON.parse(JSON.stringify(row))
        // 将当前编辑行放入全局变量中
        this.originalRow.rowEdit = row
      },
      // 取消编辑
      cancelEdit(row) {
        for (const key in this.originalRow) {
          if (this.originalRow.hasOwnProperty(key) && key !== 'edit' && key !== 'rowEdit') {
            row[key].dataValue = this.originalRow[key].dataValue
          }
        }
        row.edit = false
      },
      // 修改原始数据
      updateData(row) {
        // 初始化所有考核项键值对
        const itemValueMap = {}
        const keyArr = Object.keys(this.itemMap)
        keyArr.forEach((key) => { itemValueMap[key] = 0 })

        const rowData = Object.assign({}, row)
        // 移除userInfo属性
        delete rowData.userInfo
        // 将自有数据添加到数据中
        for (const key in rowData) {
          if (rowData.hasOwnProperty(key)) {
            itemValueMap[key] = rowData[key].dataValue
          }
        }
        const data = {
          assessDate: this.queryForm.assessDate,
          csaUserId: row.userInfo.csaUserId,
          itemValueMap: itemValueMap
        }
        new Promise((resolve, reject) => {
          updateOriginData(data).then(response => {
            this.$message({
              message: response.rspMsg,
              type: response.rspCode === this._const.RSP_CODE_SUCCESS ? 'success' : 'error',
              showClose: true
            })
            row.edit = false
            resolve(response)
          }).catch(error => {
            reject(error)
          })
        })
      },

      // 清空查询条件
      handleResetFilter() {
        this.$refs.orgTree.selectedOptions = []
        this.queryForm = {
          assessDate: '',
          orgId: 0,
          trueName: ''
        }
      },
      // 自适应高度
      resize() {
        const that = this
        // _.debounce 是一个通过 lodash 限制操作频率的函数。
        window.onresize = _.debounce(() => {
          that.tableHeight = document.body.clientHeight - 120
        }, 400)
      }
    },

    created() {
      this.getUser()
      this.getDataItemMap()
      this.queryForm.assessDate = parseTime(new Date(), '{y}-{m}')
    },
    mounted() {
      // 自适应高度
      this.resize()
    }
  }
</script>

<style scoped>

</style>
